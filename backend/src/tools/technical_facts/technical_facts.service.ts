import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../lib/errors/BaseError";
import { ensureNodeExists } from "../../modules/opinions/opinions.domainRules";
import { calculateEvidenceWeight } from "./technical_facts.domainRules";
import type {
  CreateTechnicalFactInput,
  ListPendingInteractionsQuery,
} from "./technical_facts.schema";

type PendingInteractionItem = {
  thread_id: string;
  content: string;
  opinion_id: string | null;
  node_id: string | null;
  product_id: string | null;
  evidence_weight: number;
  cached_upvotes: number | null;
  author: {
    reputation_score: number | null;
    is_banned: boolean | null;
  };
};

const listPendingInteractions = async (query: ListPendingInteractionsQuery) => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [pendingThreads, total] = await Promise.all([
    prisma.discussion_threads.findMany({
      where: { status: "PENDING" },
      include: {
        users: {
          select: {
            reputation_score: true,
            is_banned: true,
          },
        },
        opinions: {
          select: {
            node_id: true,
            product_id: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
      skip,
      take: limit,
    }),
    prisma.discussion_threads.count({
      where: { status: "PENDING" },
    }),
  ]);

  const data: PendingInteractionItem[] = pendingThreads.map((thread) => ({
    thread_id: thread.id,
    content: thread.content,
    opinion_id: thread.opinion_id,
    node_id: thread.opinions?.node_id ?? null,
    product_id: thread.opinions?.product_id ?? null,
    evidence_weight: calculateEvidenceWeight({
      cached_upvotes: thread.cached_upvotes,
      status: thread.status,
      user: {
        reputation_score: thread.users.reputation_score,
        is_banned: thread.users.is_banned,
      },
    }),
    cached_upvotes: thread.cached_upvotes,
    author: {
      reputation_score: thread.users.reputation_score,
      is_banned: thread.users.is_banned,
    },
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const createFact = async (input: CreateTechnicalFactInput) => {
  await ensureNodeExists(input.node_id);

  const uniqueThreadIds = [...new Set(input.evidence_thread_ids)];
  if (uniqueThreadIds.length !== input.evidence_thread_ids.length) {
    throw new BadRequestError(
      "evidence_thread_ids não pode conter valores duplicados"
    );
  }

  const threads = await prisma.discussion_threads.findMany({
    where: { id: { in: uniqueThreadIds } },
    select: { id: true, status: true },
  });

  if (threads.length !== uniqueThreadIds.length) {
    throw new NotFoundError("Uma ou mais threads de evidência não existem");
  }

  const nonPending = threads.filter((thread) => thread.status !== "PENDING");
  if (nonPending.length > 0) {
    throw new BadRequestError(
      "Todas as threads de evidência devem estar com status PENDING"
    );
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
      data: uniqueThreadIds.map((interactionId) => ({
        fact_id: fact.id,
        interaction_id: interactionId,
      })),
    });

    await tx.discussion_threads.updateMany({
      where: { id: { in: uniqueThreadIds } },
      data: { status: "PROCESSED" },
    });

    return {
      ...fact,
      evidence_thread_ids: uniqueThreadIds,
    };
  });
};

const markInteractionProcessed = async (threadId: string) => {
  const thread = await prisma.discussion_threads.findUnique({
    where: { id: threadId },
    select: { id: true, status: true },
  });

  if (!thread) {
    throw new NotFoundError("Interação não encontrada");
  }

  const updated = await prisma.discussion_threads.update({
    where: { id: threadId },
    data: { status: "PROCESSED" },
    select: {
      id: true,
      status: true,
    },
  });

  return updated;
};

const listByNode = async (nodeId: string) => {
  await ensureNodeExists(nodeId);

  const facts = await prisma.technical_facts.findMany({
    where: { node_id: nodeId },
    include: {
      fact_evidence: {
        select: {
          interaction_id: true,
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
      evidence_thread_ids: fact.fact_evidence.map(
        (evidence) => evidence.interaction_id
      ),
    })),
  };
};

export const technicalFactsService = {
  listPendingInteractions,
  createFact,
  markInteractionProcessed,
  listByNode,
};
