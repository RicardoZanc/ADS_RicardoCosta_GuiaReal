import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";
import { nodesService } from "../nodes/nodes.service";
import { getProductsSearchFuzziness } from "../products/products.config";
function toIsoString(date) {
    return (date ?? new Date(0)).toISOString();
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
function buildProductWhereClause(q, fuzziness, anchorNodeId) {
    const nameMatch = Prisma.sql `similarity(p.name, ${q}) >= ${fuzziness}`;
    if (!anchorNodeId) {
        return nameMatch;
    }
    return Prisma.sql `(
    ${nameMatch}
    OR EXISTS (
      SELECT 1
      FROM product_nodes pn_anchor
      WHERE pn_anchor.product_id = p.id
        AND pn_anchor.node_id = ${anchorNodeId}::uuid
    )
  )`;
}
const productSelectColumns = Prisma.sql `
  p.id,
  p.name,
  p.brand_name,
  p.image_url,
  p.created_at,
  cat_node.id AS categoria_id,
  cat_node.name AS categoria_name,
  marca_node.id AS marca_id,
  marca_node.name AS marca_name
`;
const productLateralJoins = Prisma.sql `
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
`;
async function searchProducts(q, limit, anchorNodeId) {
    const fuzziness = getProductsSearchFuzziness();
    const whereClause = buildProductWhereClause(q, fuzziness, anchorNodeId);
    const orderClause = Prisma.sql `similarity(p.name, ${q}) DESC, p.name ASC`;
    const [countResult, rows] = await Promise.all([
        prisma.$queryRaw `
      SELECT COUNT(*)::int AS count
      FROM products p
      WHERE ${whereClause}
    `,
        prisma.$queryRaw `
      SELECT ${productSelectColumns}
      FROM products p
      ${productLateralJoins}
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT ${limit}
    `,
    ]);
    const total = countResult[0]?.count ?? 0;
    return {
        data: rows.map(mapProductSearchRow),
        pagination: {
            page: 1,
            limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
    };
}
const globalSearch = async (query) => {
    logger.debug("Busca global: consulta iniciada", {
        q: query.q,
        limitNodes: query.limit_nodes,
        limitProducts: query.limit_products,
    });
    const nodes = await nodesService.search({
        q: query.q,
        page: 1,
        limit: query.limit_nodes,
    });
    const anchorNodeId = nodes.data[0]?.id;
    const products = await searchProducts(query.q, query.limit_products, anchorNodeId);
    logger.debug("Busca global: consulta concluída", {
        q: query.q,
        nodeCount: nodes.data.length,
        productCount: products.data.length,
        anchorNodeId,
    });
    return { nodes, products };
};
export const searchService = {
    globalSearch,
};
