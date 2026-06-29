import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../lib/errors/BaseError";
import { ensureNodeExists } from "../../modules/opinions/opinions.domainRules";
import { calculateEvidenceWeight, evidenceRefKey, } from "./technical_facts.domainRules";
const mapPendingRow = (row) => ({
    source_type: row.source_type,
    source_id: row.source_id,
    title: row.title,
    content: row.content,
    opinion_id: row.opinion_id,
    node_id: row.node_id,
    product_id: row.product_id,
    cached_upvotes: row.cached_upvotes,
    evidence_weight: calculateEvidenceWeight({
        cached_upvotes: row.cached_upvotes,
        status: row.status,
        user: {
            reputation_score: row.reputation_score,
            is_banned: row.is_banned,
        },
    }),
    author: {
        reputation_score: row.reputation_score,
        is_banned: row.is_banned,
    },
});
const listPendingQueue = async (query) => {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const [rows, countResult] = await Promise.all([
        prisma.$queryRaw(Prisma.sql `
      SELECT * FROM (
        SELECT
          'opinion'::text AS source_type,
          o.id AS source_id,
          o.title,
          o.content,
          o.id AS opinion_id,
          o.node_id,
          o.product_id,
          o.cached_upvotes,
          o.status,
          u.reputation_score,
          u.is_banned,
          o.created_at
        FROM opinions o
        INNER JOIN users u ON u.id = o.user_id
        WHERE o.status = 'PENDING' AND o.is_hidden = false

        UNION ALL

        SELECT
          'thread'::text AS source_type,
          dt.id AS source_id,
          NULL::varchar AS title,
          dt.content,
          dt.opinion_id,
          COALESCE(parent_op.node_id, NULL) AS node_id,
          COALESCE(parent_op.product_id, NULL) AS product_id,
          dt.cached_upvotes,
          dt.status,
          u.reputation_score,
          u.is_banned,
          dt.created_at
        FROM discussion_threads dt
        INNER JOIN users u ON u.id = dt.user_id
        LEFT JOIN opinions parent_op ON parent_op.id = dt.opinion_id
        WHERE dt.status = 'PENDING' AND dt.is_hidden = false
      ) AS pending_queue
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${skip}
    `),
        prisma.$queryRaw(Prisma.sql `
      SELECT COUNT(*)::bigint AS count FROM (
        SELECT o.id FROM opinions o WHERE o.status = 'PENDING' AND o.is_hidden = false
        UNION ALL
        SELECT dt.id FROM discussion_threads dt WHERE dt.status = 'PENDING' AND dt.is_hidden = false
      ) AS pending_count
    `),
    ]);
    const total = Number(countResult[0]?.count ?? 0);
    return {
        data: rows.map(mapPendingRow),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};
const dedupeEvidence = (evidence) => {
    const seen = new Set();
    const unique = [];
    for (const item of evidence) {
        const key = evidenceRefKey(item.source_type, item.source_id);
        if (seen.has(key)) {
            throw new BadRequestError("evidence não pode conter fontes duplicadas");
        }
        seen.add(key);
        unique.push(item);
    }
    return unique;
};
const createFact = async (input) => {
    await ensureNodeExists(input.node_id);
    const uniqueEvidence = dedupeEvidence(input.evidence);
    const opinionIds = uniqueEvidence
        .filter((item) => item.source_type === "opinion")
        .map((item) => item.source_id);
    const threadIds = uniqueEvidence
        .filter((item) => item.source_type === "thread")
        .map((item) => item.source_id);
    const [opinions, threads] = await Promise.all([
        opinionIds.length > 0
            ? prisma.opinions.findMany({
                where: { id: { in: opinionIds } },
                select: { id: true },
            })
            : Promise.resolve([]),
        threadIds.length > 0
            ? prisma.discussion_threads.findMany({
                where: { id: { in: threadIds } },
                select: { id: true },
            })
            : Promise.resolve([]),
    ]);
    if (opinions.length !== opinionIds.length) {
        throw new NotFoundError("Uma ou mais opiniões de evidência não existem");
    }
    if (threads.length !== threadIds.length) {
        throw new NotFoundError("Uma ou mais threads de evidência não existem");
    }
    return prisma.$transaction(async (tx) => {
        const fact = await tx.technical_facts.create({
            data: {
                node_id: input.node_id,
                fact_label: input.fact_label,
                fact_description: input.fact_description,
                consensus_score: input.consensus_score,
                status: input.status,
            },
            select: {
                id: true,
                node_id: true,
                fact_label: true,
                fact_description: true,
                consensus_score: true,
                status: true,
                last_updated: true,
            },
        });
        await tx.fact_evidence.createMany({
            data: uniqueEvidence.map((item) => ({
                fact_id: fact.id,
                interaction_id: item.source_type === "thread" ? item.source_id : null,
                opinion_id: item.source_type === "opinion" ? item.source_id : null,
            })),
        });
        if (opinionIds.length > 0) {
            await tx.opinions.updateMany({
                where: { id: { in: opinionIds } },
                data: { status: "PROCESSED" },
            });
        }
        if (threadIds.length > 0) {
            await tx.discussion_threads.updateMany({
                where: { id: { in: threadIds } },
                data: { status: "PROCESSED" },
            });
        }
        return {
            ...fact,
            evidence: uniqueEvidence,
        };
    });
};
const markQueueItemProcessed = async (sourceType, sourceId) => {
    if (sourceType === "opinion") {
        const opinion = await prisma.opinions.findUnique({
            where: { id: sourceId },
            select: { id: true, status: true },
        });
        if (!opinion) {
            throw new NotFoundError("Opinião não encontrada");
        }
        const updated = await prisma.opinions.update({
            where: { id: sourceId },
            data: { status: "PROCESSED" },
            select: { id: true, status: true },
        });
        return {
            source_type: "opinion",
            source_id: updated.id,
            status: updated.status,
        };
    }
    const thread = await prisma.discussion_threads.findUnique({
        where: { id: sourceId },
        select: { id: true, status: true },
    });
    if (!thread) {
        throw new NotFoundError("Thread não encontrada");
    }
    const updated = await prisma.discussion_threads.update({
        where: { id: sourceId },
        data: { status: "PROCESSED" },
        select: { id: true, status: true },
    });
    return {
        source_type: "thread",
        source_id: updated.id,
        status: updated.status,
    };
};
const listByNode = async (nodeId) => {
    await ensureNodeExists(nodeId);
    const facts = await prisma.technical_facts.findMany({
        where: { node_id: nodeId },
        include: {
            fact_evidence: {
                select: {
                    interaction_id: true,
                    opinion_id: true,
                },
            },
        },
        orderBy: { last_updated: "desc" },
    });
    return {
        data: facts.map((fact) => ({
            id: fact.id,
            node_id: fact.node_id,
            fact_label: fact.fact_label,
            fact_description: fact.fact_description,
            consensus_score: fact.consensus_score,
            status: fact.status,
            last_updated: fact.last_updated,
            evidence: fact.fact_evidence.map((item) => item.opinion_id
                ? {
                    source_type: "opinion",
                    source_id: item.opinion_id,
                }
                : {
                    source_type: "thread",
                    source_id: item.interaction_id,
                }),
        })),
    };
};
const listByEvidence = async (sourceType, sourceId) => {
    const evidenceRows = await prisma.fact_evidence.findMany({
        where: sourceType === "opinion"
            ? { opinion_id: sourceId }
            : { interaction_id: sourceId },
        select: { fact_id: true },
    });
    const factIds = [...new Set(evidenceRows.map((row) => row.fact_id))];
    if (factIds.length === 0) {
        return { data: [], reported_source: null };
    }
    const [facts, reportedSource] = await Promise.all([
        prisma.technical_facts.findMany({
            where: { id: { in: factIds } },
            include: {
                fact_evidence: {
                    select: {
                        interaction_id: true,
                        opinion_id: true,
                    },
                },
            },
            orderBy: { last_updated: "desc" },
        }),
        sourceType === "opinion"
            ? prisma.opinions.findUnique({
                where: { id: sourceId },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    is_hidden: true,
                    reports_locked: true,
                    users: { select: { id: true, username: true } },
                },
            })
            : prisma.discussion_threads.findUnique({
                where: { id: sourceId },
                select: {
                    id: true,
                    content: true,
                    is_hidden: true,
                    reports_locked: true,
                    users: { select: { id: true, username: true } },
                },
            }),
    ]);
    if (!reportedSource) {
        throw new NotFoundError("Fonte de evidência não encontrada");
    }
    return {
        reported_source: {
            source_type: sourceType,
            source_id: sourceId,
            title: "title" in reportedSource ? reportedSource.title : null,
            content: reportedSource.content,
            is_hidden: reportedSource.is_hidden,
            reports_locked: reportedSource.reports_locked,
            author: reportedSource.users,
        },
        data: facts.map((fact) => ({
            id: fact.id,
            node_id: fact.node_id,
            fact_label: fact.fact_label,
            fact_description: fact.fact_description,
            consensus_score: fact.consensus_score,
            status: fact.status,
            last_updated: fact.last_updated,
            evidence: fact.fact_evidence.map((item) => item.opinion_id
                ? {
                    source_type: "opinion",
                    source_id: item.opinion_id,
                }
                : {
                    source_type: "thread",
                    source_id: item.interaction_id,
                }),
        })),
    };
};
const updateFact = async (factId, input) => {
    const existing = await prisma.technical_facts.findUnique({
        where: { id: factId },
        select: { id: true },
    });
    if (!existing) {
        throw new NotFoundError("Fato técnico não encontrado");
    }
    const updated = await prisma.technical_facts.update({
        where: { id: factId },
        data: {
            ...(input.fact_label !== undefined
                ? { fact_label: input.fact_label }
                : {}),
            ...(input.fact_description !== undefined
                ? { fact_description: input.fact_description }
                : {}),
            ...(input.consensus_score !== undefined
                ? { consensus_score: input.consensus_score }
                : {}),
            ...(input.status !== undefined ? { status: input.status } : {}),
            last_updated: new Date(),
        },
        select: {
            id: true,
            node_id: true,
            fact_label: true,
            fact_description: true,
            consensus_score: true,
            status: true,
            last_updated: true,
        },
    });
    return updated;
};
const removeEvidence = async (factId, sourceType, sourceId) => {
    const evidence = await prisma.fact_evidence.findFirst({
        where: {
            fact_id: factId,
            ...(sourceType === "opinion"
                ? { opinion_id: sourceId }
                : { interaction_id: sourceId }),
        },
        select: { id: true },
    });
    if (!evidence) {
        throw new NotFoundError("Evidência não encontrada para este fato");
    }
    await prisma.fact_evidence.delete({ where: { id: evidence.id } });
    return {
        fact_id: factId,
        source_type: sourceType,
        source_id: sourceId,
        removed: true,
    };
};
export const technicalFactsService = {
    listPendingQueue,
    createFact,
    markQueueItemProcessed,
    listByNode,
    listByEvidence,
    updateFact,
    removeEvidence,
};
