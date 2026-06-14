import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { fetchNodeGraph } from "../../lib/nodeGraph";
import { listOpinionsPage } from "../../lib/opinionListing";
import { ConflictError, NotFoundError } from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
import type { CreateProductInput, ListProductOpinionsQuery } from "./products.schema";
import {
  buildDiscussionTabs,
  buildProductTaxonomy,
  ensureEanAvailable,
  ensureNameAvailable,
  ensureProductExists,
  ensureProductLinkedNode,
  validateProductNodeDependencies,
} from "./products.domainRules";

type PrismaErrorWithCode = {
  code?: string;
};

function isUniqueConstraintError(error: unknown): error is PrismaErrorWithCode {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as PrismaErrorWithCode).code === "P2002"
  );
}

function toIsoString(date: Date | null | undefined): string {
  return (date ?? new Date(0)).toISOString();
}

async function fetchOpinionCounts(
  productId: string,
  nodeIds: string[]
): Promise<{ productCount: number; nodeCounts: Map<string, number> }> {
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

  const nodeCounts = new Map<string, number>();
  for (const row of nodeCountRows) {
    if (row.node_id) {
      nodeCounts.set(row.node_id, row._count._all);
    }
  }

  return { productCount, nodeCounts };
}

const getById = async (id: string) => {
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
  const discussionTabs = buildDiscussionTabs(
    seedNodes,
    productCount,
    nodeCounts
  );

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

const listOpinions = async (productId: string, query: ListProductOpinionsQuery) => {
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

  const whereClause =
    query.scope === "product"
      ? Prisma.sql`o.product_id = ${productId}::uuid`
      : Prisma.sql`o.node_id = ${query.node_id!}::uuid`;

  const result = await listOpinionsPage({
    whereClause,
    page: query.page,
    limit: query.limit,
  });

  logger.debug("Opiniões de produto: consulta concluída", {
    productId,
    scope: query.scope,
    total: result.pagination.total,
    returned: result.data.length,
  });

  return result;
};

const create = async (input: CreateProductInput) => {
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
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      logger.warn("Cadastro de produto rejeitado: conflito de unicidade", {
        ean: input.ean,
      });
      throw new ConflictError("Produto já existe com os mesmos dados únicos");
    }
    throw error;
  }
};

export const productsService = {
  create,
  getById,
  listOpinions,
};
