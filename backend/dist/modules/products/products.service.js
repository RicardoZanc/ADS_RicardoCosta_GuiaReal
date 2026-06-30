import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { fetchNodeGraph } from "../../lib/nodeGraph";
import { listOpinionsPage } from "../../lib/opinionListing";
import { ConflictError, NotFoundError } from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
import { getProductsSearchFuzziness } from "./products.config";
import { buildDiscussionTabs, buildProductTaxonomy, ensureEanAvailable, ensureNameAvailable, ensureProductExists, ensureProductLinkedNode, resolveProductSearchScope, validateProductNodeDependencies, validateProductUpdate, } from "./products.domainRules";
function isUniqueConstraintError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002");
}
function toIsoString(date) {
    return (date ?? new Date(0)).toISOString();
}
function buildScopedProductsCte(scope) {
    if (scope.categoria_id) {
        return Prisma.sql `
      scoped_products AS (
        SELECT DISTINCT p.id
        FROM products p
        INNER JOIN product_nodes pn ON pn.product_id = p.id
          AND pn.node_id = ${scope.categoria_id}::uuid
      )
    `;
    }
    return Prisma.sql `
    scoped_products AS (
      SELECT DISTINCT p.id
      FROM products p
      INNER JOIN product_nodes pn ON pn.product_id = p.id
      INNER JOIN nodes cat ON cat.id = pn.node_id
        AND cat.type = 'CATEGORIA'::node_type
        AND cat.parent_id = ${scope.tipo_id}::uuid
    )
  `;
}
function buildNodeFiltersClause(nodeIds) {
    if (nodeIds.length === 0) {
        return Prisma.sql `TRUE`;
    }
    const conditions = nodeIds.map((nodeId) => Prisma.sql `EXISTS (
      SELECT 1
      FROM product_nodes pn_filter
      WHERE pn_filter.product_id = p.id
        AND pn_filter.node_id = ${nodeId}::uuid
    )`);
    return Prisma.join(conditions, " AND ");
}
function buildNameFilterClause(q, fuzziness) {
    if (!q) {
        return Prisma.sql `TRUE`;
    }
    return Prisma.sql `similarity(p.name, ${q}) >= ${fuzziness}`;
}
function buildSearchOrderClause(q) {
    if (q) {
        return Prisma.sql `similarity(p.name, ${q}) DESC, p.name ASC`;
    }
    return Prisma.sql `p.name ASC`;
}
function toFacetNode(row) {
    return {
        id: row.id,
        name: row.name,
        productCount: row.product_count,
    };
}
function mapFacetRows(rows) {
    return {
        tecnologias: rows
            .filter((row) => row.type === "TECNOLOGIA")
            .map(toFacetNode),
        composicoes: rows
            .filter((row) => row.type === "COMPOSICAO")
            .map(toFacetNode),
        atributos: rows
            .filter((row) => row.type === "ATRIBUTO")
            .map(toFacetNode),
    };
}
function buildFacetNameFilterClause(q, fuzziness) {
    if (!q) {
        return Prisma.sql `TRUE`;
    }
    return Prisma.sql `similarity(n.name, ${q}) >= ${fuzziness}`;
}
function buildFacetOrderClause(q) {
    if (q) {
        return Prisma.sql `name_similarity DESC, product_count DESC, name ASC`;
    }
    return Prisma.sql `product_count DESC, name ASC`;
}
function mapProductSearchRow(row) {
    return {
        id: row.id,
        name: row.name,
        brand_name: row.brand_name,
        image_url: row.image_url,
        created_at: toIsoString(row.created_at),
        categoria: row.categoria_id && row.categoria_name
            ? { id: row.categoria_id, name: row.categoria_name }
            : null,
        marca: row.marca_id && row.marca_name
            ? { id: row.marca_id, name: row.marca_name }
            : null,
    };
}
const getFacetsGrouped = async (query) => {
    const scope = await resolveProductSearchScope(query);
    const scopedProductsCte = buildScopedProductsCte(scope);
    logger.debug("Facets de produto: consulta agrupada iniciada", scope);
    const rows = await prisma.$queryRaw `
    WITH ${scopedProductsCte}
    SELECT
      n.id,
      n.name,
      n.type,
      COUNT(DISTINCT sp.id)::int AS product_count
    FROM scoped_products sp
    INNER JOIN product_nodes pn ON pn.product_id = sp.id
    INNER JOIN nodes n ON n.id = pn.node_id
    WHERE n.type IN (
      'TECNOLOGIA'::node_type,
      'COMPOSICAO'::node_type,
      'ATRIBUTO'::node_type
    )
    GROUP BY n.id, n.name, n.type
    ORDER BY n.type, n.name
  `;
    logger.debug("Facets de produto: consulta agrupada concluída", {
        ...scope,
        totalFacets: rows.length,
    });
    return mapFacetRows(rows);
};
const searchFacets = async (query) => {
    const scope = await resolveProductSearchScope(query);
    const fuzziness = getProductsSearchFuzziness();
    const scopedProductsCte = buildScopedProductsCte(scope);
    const nameFilterClause = buildFacetNameFilterClause(query.q, fuzziness);
    const orderClause = buildFacetOrderClause(query.q);
    const offset = (query.page - 1) * query.limit;
    logger.debug("Facets de produto: busca paginada iniciada", {
        ...scope,
        facetType: query.facet_type,
        q: query.q,
        page: query.page,
        limit: query.limit,
    });
    const facetNodesCte = query.q
        ? Prisma.sql `
        facet_nodes AS (
          SELECT
            n.id,
            n.name,
            n.type,
            COUNT(DISTINCT sp.id)::int AS product_count,
            similarity(n.name, ${query.q}) AS name_similarity
          FROM scoped_products sp
          INNER JOIN product_nodes pn ON pn.product_id = sp.id
          INNER JOIN nodes n ON n.id = pn.node_id
          WHERE n.type = ${query.facet_type}::node_type
            AND ${nameFilterClause}
          GROUP BY n.id, n.name, n.type
        )
      `
        : Prisma.sql `
        facet_nodes AS (
          SELECT
            n.id,
            n.name,
            n.type,
            COUNT(DISTINCT sp.id)::int AS product_count,
            0::float AS name_similarity
          FROM scoped_products sp
          INNER JOIN product_nodes pn ON pn.product_id = sp.id
          INNER JOIN nodes n ON n.id = pn.node_id
          WHERE n.type = ${query.facet_type}::node_type
          GROUP BY n.id, n.name, n.type
        )
      `;
    const [countResult, rows] = await Promise.all([
        prisma.$queryRaw `
      WITH ${scopedProductsCte}, ${facetNodesCte}
      SELECT COUNT(*)::int AS count FROM facet_nodes
    `,
        prisma.$queryRaw `
      WITH ${scopedProductsCte}, ${facetNodesCte}
      SELECT id, name, type, product_count
      FROM facet_nodes
      ORDER BY ${orderClause}
      LIMIT ${query.limit} OFFSET ${offset}
    `,
    ]);
    const total = countResult[0]?.count ?? 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);
    logger.debug("Facets de produto: busca paginada concluída", {
        ...scope,
        facetType: query.facet_type,
        total,
        returned: rows.length,
    });
    return {
        data: rows.map(toFacetNode),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages,
        },
    };
};
const getFacets = async (query) => {
    if (query.facet_type) {
        return searchFacets(query);
    }
    return getFacetsGrouped(query);
};
const search = async (query) => {
    const scope = await resolveProductSearchScope(query);
    const fuzziness = getProductsSearchFuzziness();
    const nodeIds = [...new Set(query.node_ids ?? [])];
    const offset = (query.page - 1) * query.limit;
    const scopedProductsCte = buildScopedProductsCte(scope);
    const nodeFiltersClause = buildNodeFiltersClause(nodeIds);
    const nameFilterClause = buildNameFilterClause(query.q, fuzziness);
    const orderClause = buildSearchOrderClause(query.q);
    logger.debug("Busca de produtos: consulta iniciada", {
        ...scope,
        nodeCount: nodeIds.length,
        q: query.q,
        page: query.page,
        limit: query.limit,
        fuzziness,
    });
    const [countResult, rows] = await Promise.all([
        prisma.$queryRaw `
      WITH ${scopedProductsCte}
      SELECT COUNT(*)::int AS count
      FROM products p
      INNER JOIN scoped_products sp ON sp.id = p.id
      WHERE ${nodeFiltersClause}
        AND ${nameFilterClause}
    `,
        prisma.$queryRaw `
      WITH ${scopedProductsCte}
      SELECT
        p.id,
        p.name,
        p.brand_name,
        p.image_url,
        p.created_at,
        cat_node.id AS categoria_id,
        cat_node.name AS categoria_name,
        marca_node.id AS marca_id,
        marca_node.name AS marca_name
      FROM products p
      INNER JOIN scoped_products sp ON sp.id = p.id
      LEFT JOIN LATERAL (
        SELECT n.id, n.name
        FROM product_nodes pn
        INNER JOIN nodes n ON n.id = pn.node_id
          AND n.type = 'CATEGORIA'::node_type
        WHERE pn.product_id = p.id
        LIMIT 1
      ) cat_node ON TRUE
      LEFT JOIN LATERAL (
        SELECT n.id, n.name
        FROM product_nodes pn
        INNER JOIN nodes n ON n.id = pn.node_id
          AND n.type = 'MARCA'::node_type
        WHERE pn.product_id = p.id
        LIMIT 1
      ) marca_node ON TRUE
      WHERE ${nodeFiltersClause}
        AND ${nameFilterClause}
      ORDER BY ${orderClause}
      LIMIT ${query.limit}
      OFFSET ${offset}
    `,
    ]);
    const total = countResult[0]?.count ?? 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);
    logger.debug("Busca de produtos: consulta concluída", {
        ...scope,
        total,
        returned: rows.length,
    });
    return {
        data: rows.map(mapProductSearchRow),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages,
        },
    };
};
async function fetchOpinionCounts(productId, nodeIds) {
    const [productCount, nodeCountRows] = await Promise.all([
        prisma.opinions.count({
            where: { product_id: productId },
        }),
        nodeIds.length > 0
            ? prisma.opinions.groupBy({
                by: ["node_id"],
                where: { node_id: { in: nodeIds } },
                _count: { _all: true },
            })
            : Promise.resolve([]),
    ]);
    const nodeCounts = new Map();
    for (const row of nodeCountRows) {
        if (row.node_id) {
            nodeCounts.set(row.node_id, row._count._all);
        }
    }
    return { productCount, nodeCounts };
}
const getById = async (id) => {
    logger.debug("Detalhe de produto: consulta iniciada", { productId: id });
    const product = await prisma.products.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            ean: true,
            brand_name: true,
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
        },
    });
    if (!product) {
        throw new NotFoundError("Produto não encontrado");
    }
    const seedNodes = product.product_nodes.map((item) => item.nodes);
    const nodeById = await fetchNodeGraph(seedNodes.map((node) => node.id));
    const taxonomy = buildProductTaxonomy(seedNodes, nodeById);
    const linkedNodeIds = seedNodes.map((node) => node.id);
    const { productCount, nodeCounts } = await fetchOpinionCounts(id, linkedNodeIds);
    const discussionTabs = buildDiscussionTabs(seedNodes, productCount, nodeCounts);
    logger.debug("Detalhe de produto: consulta concluída", { productId: id });
    return {
        id: product.id,
        name: product.name,
        ean: product.ean,
        brand_name: product.brand_name,
        image_url: product.image_url,
        created_at: toIsoString(product.created_at),
        taxonomy,
        discussionTabs,
    };
};
const listOpinions = async (productId, query, userId) => {
    logger.debug("Opiniões de produto: consulta iniciada", {
        productId,
        scope: query.scope,
        nodeId: query.node_id,
        page: query.page,
        limit: query.limit,
    });
    await ensureProductExists(productId);
    if (query.scope === "node" && query.node_id) {
        await ensureProductLinkedNode(productId, query.node_id);
    }
    const whereClause = query.scope === "product"
        ? Prisma.sql `o.product_id = ${productId}::uuid`
        : Prisma.sql `o.node_id = ${query.node_id}::uuid`;
    const result = await listOpinionsPage({
        whereClause,
        page: query.page,
        limit: query.limit,
        userId,
    });
    logger.debug("Opiniões de produto: consulta concluída", {
        productId,
        scope: query.scope,
        total: result.pagination.total,
        returned: result.data.length,
    });
    return result;
};
const create = async (input) => {
    logger.debug("Cadastro de produto: payload recebido", {
        name: input.name,
        hasEan: Boolean(input.ean),
        nodeCount: input.nodeIds.length,
    });
    await ensureNameAvailable(input.name);
    await ensureEanAvailable(input.ean);
    const validNodeIds = await validateProductNodeDependencies(input.nodeIds);
    try {
        const product = await prisma.products.create({
            data: {
                name: input.name,
                ean: input.ean,
                brand_name: input.brand_name,
                image_url: input.image_url,
                product_nodes: {
                    create: validNodeIds.map((nodeId) => ({
                        node_id: nodeId,
                    })),
                },
            },
            select: {
                id: true,
                name: true,
                ean: true,
                brand_name: true,
                image_url: true,
                created_at: true,
                product_nodes: {
                    select: {
                        node_id: true,
                    },
                },
            },
        });
        logger.debug("Cadastro de produto: persistência concluída", {
            productId: product.id,
            nodeCount: product.product_nodes.length,
        });
        return {
            ...product,
            nodeIds: product.product_nodes.map((item) => item.node_id),
        };
    }
    catch (error) {
        if (isUniqueConstraintError(error)) {
            logger.warn("Cadastro de produto rejeitado: conflito de unicidade", {
                ean: input.ean,
            });
            throw new ConflictError("Produto já existe com os mesmos dados únicos");
        }
        throw error;
    }
};
const applyProductUpdate = async (id, input) => {
    logger.debug("Atualização de produto: payload recebido", {
        productId: id,
        hasName: input.name !== undefined,
        hasImage: input.image_url !== undefined,
        hasNodeIds: input.nodeIds !== undefined,
    });
    await validateProductUpdate(id, input);
    const data = {};
    if (input.name !== undefined) {
        data.name = input.name;
    }
    if (input.image_url !== undefined) {
        data.image_url = input.image_url;
    }
    let validNodeIds;
    if (input.nodeIds !== undefined) {
        validNodeIds = await validateProductNodeDependencies(input.nodeIds);
    }
    try {
        await prisma.$transaction(async (tx) => {
            if (validNodeIds) {
                await tx.product_nodes.deleteMany({ where: { product_id: id } });
                await tx.products.update({
                    where: { id },
                    data: {
                        ...data,
                        product_nodes: {
                            create: validNodeIds.map((nodeId) => ({ node_id: nodeId })),
                        },
                    },
                });
                return;
            }
            if (Object.keys(data).length > 0) {
                await tx.products.update({ where: { id }, data });
            }
        });
        logger.debug("Atualização de produto: persistência concluída", {
            productId: id,
        });
        return getById(id);
    }
    catch (error) {
        if (isUniqueConstraintError(error)) {
            logger.warn("Atualização de produto rejeitada: conflito de unicidade", {
                productId: id,
            });
            throw new ConflictError("Produto já existe com os mesmos dados únicos");
        }
        throw error;
    }
};
const update = applyProductUpdate;
export const productsService = {
    create,
    update,
    applyProductUpdate,
    getById,
    getFacets,
    listOpinions,
    search,
};
