import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { fetchNodeGraph } from "../../lib/nodeGraph";
import { logger } from "../../utils/logger";
export const SIMPLIFIED_SECTION_LIMIT = 8;
const PREVIEWS_PER_ITEM = 3;
const ALLOWED_FEED_NODE_TYPES = [
    "COMPOSICAO",
    "TECNOLOGIA",
    "MARCA",
    "ATRIBUTO",
];
const allowedFeedNodeTypesSet = new Set(ALLOWED_FEED_NODE_TYPES);
const FEED_ITEMS_CTE = Prisma.sql `
  feed_items AS (
    SELECT
      'product'::text AS kind,
      p.id,
      p.created_at,
      (
        SELECT MAX(
          GREATEST(
            o.created_at,
            COALESCE(dt.created_at, o.created_at)
          )
        )
        FROM opinions o
        LEFT JOIN discussion_threads dt ON dt.opinion_id = o.id
        WHERE o.product_id = p.id
      ) AS last_activity_at
    FROM products p

    UNION ALL

    SELECT
      'node'::text AS kind,
      n.id,
      n.created_at,
      (
        SELECT MAX(
          GREATEST(
            o.created_at,
            COALESCE(dt.created_at, o.created_at)
          )
        )
        FROM opinions o
        LEFT JOIN discussion_threads dt ON dt.opinion_id = o.id
        WHERE o.node_id = n.id
      ) AS last_activity_at
    FROM nodes n
    WHERE n.type IN (
      'COMPOSICAO'::node_type,
      'TECNOLOGIA'::node_type,
      'MARCA'::node_type,
      'ATRIBUTO'::node_type
    )
  )
`;
function isAllowedFeedNodeType(type) {
    return allowedFeedNodeTypesSet.has(type);
}
function toIsoString(date) {
    return (date ?? new Date(0)).toISOString();
}
function buildDiscussionPreviews(opinions) {
    const previews = [];
    const usedIds = new Set();
    const rootThreads = opinions
        .flatMap((opinion) => opinion.discussion_threads
        .filter((thread) => thread.parent_interaction_id === null)
        .map((thread) => ({
        id: thread.id,
        content: thread.content,
        created_at: thread.created_at,
        author: thread.users,
    })))
        .sort((a, b) => (b.created_at?.getTime() ?? 0) - (a.created_at?.getTime() ?? 0));
    for (const thread of rootThreads) {
        if (previews.length >= PREVIEWS_PER_ITEM)
            break;
        previews.push({
            id: thread.id,
            content: thread.content,
            created_at: toIsoString(thread.created_at),
            author: { id: thread.author.id, username: thread.author.username },
        });
        usedIds.add(thread.id);
    }
    if (previews.length < PREVIEWS_PER_ITEM) {
        const sortedOpinions = [...opinions].sort((a, b) => (b.created_at?.getTime() ?? 0) - (a.created_at?.getTime() ?? 0));
        for (const opinion of sortedOpinions) {
            if (previews.length >= PREVIEWS_PER_ITEM)
                break;
            if (usedIds.has(opinion.id))
                continue;
            previews.push({
                id: opinion.id,
                content: opinion.content,
                created_at: toIsoString(opinion.created_at),
                author: { id: opinion.users.id, username: opinion.users.username },
            });
            usedIds.add(opinion.id);
        }
    }
    return previews;
}
function resolveNodesWithParents(seedNodes, nodeById) {
    const result = new Map();
    for (const seed of seedNodes) {
        let current = seed;
        while (current) {
            if (isAllowedFeedNodeType(current.type)) {
                result.set(current.id, {
                    id: current.id,
                    name: current.name,
                    type: current.type,
                });
            }
            current = current.parent_id
                ? nodeById.get(current.parent_id)
                : undefined;
        }
    }
    return Array.from(result.values());
}
const opinionSelect = {
    id: true,
    content: true,
    created_at: true,
    users: { select: { id: true, username: true } },
    discussion_threads: {
        select: {
            id: true,
            content: true,
            created_at: true,
            parent_interaction_id: true,
            users: { select: { id: true, username: true } },
        },
    },
};
function buildInterestFilter(interestNodeIds) {
    const idList = Prisma.join(interestNodeIds.map((id) => Prisma.sql `${id}::uuid`), ", ");
    return Prisma.sql `
    (
      (kind = 'product' AND EXISTS (
        SELECT 1
        FROM product_nodes pn
        JOIN nodes cat ON cat.id = pn.node_id AND cat.type = 'CATEGORIA'::node_type
        WHERE pn.product_id = feed_items.id
        AND (cat.id IN (${idList}) OR cat.parent_id IN (${idList}))
      ))
      OR (kind = 'node' AND EXISTS (
        SELECT 1
        FROM product_nodes pn_link
        JOIN product_nodes pn_cat ON pn_cat.product_id = pn_link.product_id
        JOIN nodes cat ON cat.id = pn_cat.node_id AND cat.type = 'CATEGORIA'::node_type
        WHERE pn_link.node_id = feed_items.id
        AND (cat.id IN (${idList}) OR cat.parent_id IN (${idList}))
      ))
    )
  `;
}
async function fetchFeedItemRows(options) {
    const { limit, offset = 0, orderBy, requireActivity = false, interestNodeIds = null, } = options;
    if (interestNodeIds !== null && interestNodeIds.length === 0) {
        return [];
    }
    const conditions = [];
    if (requireActivity) {
        conditions.push(Prisma.sql `last_activity_at IS NOT NULL`);
    }
    if (interestNodeIds !== null) {
        conditions.push(buildInterestFilter(interestNodeIds));
    }
    const whereClause = conditions.length > 0
        ? Prisma.sql `WHERE ${Prisma.join(conditions, " AND ")}`
        : Prisma.empty;
    const orderClause = orderBy === "created"
        ? Prisma.sql `ORDER BY created_at DESC`
        : Prisma.sql `ORDER BY last_activity_at DESC NULLS LAST, created_at DESC`;
    return prisma.$queryRaw `
    WITH ${FEED_ITEMS_CTE}
    SELECT kind, id
    FROM feed_items
    ${whereClause}
    ${orderClause}
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}
async function enrichFeedItems(itemRows) {
    if (itemRows.length === 0) {
        return [];
    }
    const productIds = itemRows
        .filter((row) => row.kind === "product")
        .map((row) => row.id);
    const nodeIds = itemRows
        .filter((row) => row.kind === "node")
        .map((row) => row.id);
    const [products, nodes] = await Promise.all([
        productIds.length > 0
            ? prisma.products.findMany({
                where: { id: { in: productIds } },
                select: {
                    id: true,
                    name: true,
                    image_url: true,
                    created_at: true,
                    product_nodes: {
                        select: {
                            nodes: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true,
                                    parent_id: true,
                                },
                            },
                        },
                    },
                    opinions: {
                        select: opinionSelect,
                    },
                },
            })
            : Promise.resolve([]),
        nodeIds.length > 0
            ? prisma.nodes.findMany({
                where: { id: { in: nodeIds } },
                select: {
                    id: true,
                    name: true,
                    created_at: true,
                    type: true,
                    parent_id: true,
                    opinions: {
                        select: opinionSelect,
                    },
                },
            })
            : Promise.resolve([]),
    ]);
    const productSeedNodeIds = products.flatMap((product) => product.product_nodes.map((pn) => pn.nodes.id));
    const nodeGraphSeedIds = [...new Set([...productSeedNodeIds, ...nodeIds])];
    const nodeById = await fetchNodeGraph(nodeGraphSeedIds);
    const productMap = new Map(products.map((product) => [product.id, product]));
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    return itemRows.map((row) => {
        if (row.kind === "product") {
            const product = productMap.get(row.id);
            if (!product) {
                throw new Error(`Produto do feed não encontrado: ${row.id}`);
            }
            const seedNodes = product.product_nodes.map((pn) => pn.nodes);
            const feedNodes = resolveNodesWithParents(seedNodes, nodeById);
            const marcaNode = seedNodes.find((node) => node.type === "MARCA");
            return {
                kind: "product",
                id: product.id,
                name: product.name,
                brand_name: marcaNode?.name ?? null,
                image_url: product.image_url,
                created_at: toIsoString(product.created_at),
                nodes: feedNodes,
                discussionPreviews: buildDiscussionPreviews(product.opinions),
            };
        }
        const node = nodeMap.get(row.id);
        if (!node) {
            throw new Error(`Nó do feed não encontrado: ${row.id}`);
        }
        const seedNode = nodeById.get(node.id) ?? {
            id: node.id,
            name: node.name,
            type: node.type,
            parent_id: node.parent_id,
        };
        return {
            kind: "node",
            id: node.id,
            name: node.name,
            brand_name: null,
            image_url: null,
            created_at: toIsoString(node.created_at),
            nodes: resolveNodesWithParents([seedNode], nodeById),
            discussionPreviews: buildDiscussionPreviews(node.opinions),
        };
    });
}
async function fetchUserInterestNodeIds(userId) {
    const rows = await prisma.user_interests.findMany({
        where: { user_id: userId },
        select: { node_id: true },
    });
    return rows.map((row) => row.node_id);
}
const list = async (query) => {
    const offset = (query.page - 1) * query.limit;
    logger.debug("Feed: consulta iniciada", {
        page: query.page,
        limit: query.limit,
    });
    const [countResult, itemRows] = await Promise.all([
        prisma.$queryRaw `
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT id FROM products
        UNION ALL
        SELECT id FROM nodes
        WHERE type IN (
          'COMPOSICAO'::node_type,
          'TECNOLOGIA'::node_type,
          'MARCA'::node_type,
          'ATRIBUTO'::node_type
        )
      ) AS feed_items
    `,
        fetchFeedItemRows({
            limit: query.limit,
            offset,
            orderBy: "activity",
        }),
    ]);
    const total = countResult[0]?.count ?? 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);
    const data = await enrichFeedItems(itemRows);
    logger.debug("Feed: consulta concluída", {
        page: query.page,
        limit: query.limit,
        total,
        returned: data.length,
    });
    return {
        data,
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages,
        },
    };
};
const listSimplified = async (userId, limit) => {
    logger.debug("Feed simplificado: consulta iniciada", { userId, limit });
    const interestNodeIds = await fetchUserInterestNodeIds(userId);
    const [communityRows, interestRows, newRows] = await Promise.all([
        fetchFeedItemRows({
            limit,
            orderBy: "activity",
            requireActivity: true,
        }),
        fetchFeedItemRows({
            limit,
            orderBy: "activity",
            interestNodeIds,
        }),
        fetchFeedItemRows({
            limit,
            orderBy: "created",
        }),
    ]);
    const [community, interests, newItems] = await Promise.all([
        enrichFeedItems(communityRows),
        enrichFeedItems(interestRows),
        enrichFeedItems(newRows),
    ]);
    logger.debug("Feed simplificado: consulta concluída", {
        community: community.length,
        interests: interests.length,
        new: newItems.length,
    });
    return { community, interests, new: newItems };
};
export const feedService = { list, listSimplified };
