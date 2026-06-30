import { prisma } from "../../lib/prisma";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
import type { NodeGraphRow } from "../../lib/nodeGraph";
import { fetchNodeGraph } from "../../lib/nodeGraph";
import type { node_type } from "../../generated/prisma/enums";

const forbiddenProductNodeTypes = ["ROOT", "TIPO"] as const;
const forbiddenProductNodeTypesSet = new Set<string>(forbiddenProductNodeTypes);
const allowedProductNodeTypes = [
  "CATEGORIA",
  "MARCA",
  "TECNOLOGIA",
  "COMPOSICAO",
  "ATRIBUTO",
] as const;

type ProductNodeType = (typeof allowedProductNodeTypes)[number];

const discussionTabNodeTypes = [
  "MARCA",
  "TECNOLOGIA",
  "COMPOSICAO",
  "ATRIBUTO",
] as const;

type DiscussionTabNodeType = (typeof discussionTabNodeTypes)[number];

const discussionTabNodeTypesSet = new Set<string>(discussionTabNodeTypes);

export type ProductNodeRef = {
  id: string;
  name: string;
};

export type ProductTaxonomy = {
  tipo: ProductNodeRef | null;
  categoria: ProductNodeRef | null;
  marca: ProductNodeRef | null;
  tecnologias: ProductNodeRef[];
  composicoes: ProductNodeRef[];
  atributos: ProductNodeRef[];
};

export type ProductDiscussionTab =
  | {
      scope: "product";
      label: string;
      opinionCount: number;
    }
  | {
      scope: "node";
      nodeId: string;
      type: DiscussionTabNodeType;
      label: string;
      opinionCount: number;
    };

type LinkedProductNode = {
  id: string;
  name: string;
  type: node_type;
  parent_id: string | null;
};

function toNodeRef(node: LinkedProductNode): ProductNodeRef {
  return { id: node.id, name: node.name };
}

function countNodeType(types: ProductNodeType[], target: ProductNodeType) {
  return types.filter((type) => type === target).length;
}

function assertExactlyOneCategoryAndBrand(nodeTypes: ProductNodeType[]) {
  const categoryCount = countNodeType(nodeTypes, "CATEGORIA");
  const brandCount = countNodeType(nodeTypes, "MARCA");

  if (categoryCount !== 1 || brandCount !== 1) {
    logger.warn(
      "Cadastro de produto rejeitado: composição inválida de categoria e marca",
      {
        categoryCount,
        brandCount,
      }
    );
    throw new BadRequestError(
      "O produto deve possuir exatamente uma CATEGORIA e exatamente uma MARCA"
    );
  }
}

export async function validateProductNodeDependencies(nodeIds: string[]) {
  const uniqueNodeIds = [...new Set(nodeIds)];
  if (uniqueNodeIds.length !== nodeIds.length) {
    logger.warn("Cadastro de produto rejeitado: nodeIds duplicados");
    throw new BadRequestError("nodeIds não pode conter valores duplicados");
  }

  const nodes = await prisma.nodes.findMany({
    where: {
      id: { in: uniqueNodeIds },
    },
    select: {
      id: true,
      type: true,
    },
  });

  if (nodes.length !== uniqueNodeIds.length) {
    logger.warn("Cadastro de produto rejeitado: nodeIds inexistentes", {
      requestedCount: uniqueNodeIds.length,
      foundCount: nodes.length,
    });
    throw new NotFoundError("Um ou mais nodeIds informados não existem");
  }

  const nodeTypes = nodes.map((node) => node.type);
  const hasForbiddenType = nodeTypes.some((type) =>
    forbiddenProductNodeTypesSet.has(type)
  );

  if (hasForbiddenType) {
    logger.warn("Cadastro de produto rejeitado: tipo de nó proibido", {
      forbiddenTypes: forbiddenProductNodeTypes,
    });
    throw new BadRequestError(
      "nodeIds não pode conter nós do tipo ROOT ou TIPO"
    );
  }

  const hasUnsupportedType = nodeTypes.some(
    (type) => !allowedProductNodeTypes.includes(type as ProductNodeType)
  );

  if (hasUnsupportedType) {
    logger.warn("Cadastro de produto rejeitado: tipo de nó não suportado", {
      nodeTypes,
    });
    throw new BadRequestError("nodeIds contém tipos de nó não suportados");
  }

  assertExactlyOneCategoryAndBrand(nodeTypes as ProductNodeType[]);

  return uniqueNodeIds;
}

export async function ensureProductExists(productId: string) {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new NotFoundError("Produto não encontrado");
  }
}

export async function ensureProductLinkedNode(
  productId: string,
  nodeId: string
) {
  await ensureProductExists(productId);

  const link = await prisma.product_nodes.findUnique({
    where: {
      product_id_node_id: {
        product_id: productId,
        node_id: nodeId,
      },
    },
    select: { node_id: true },
  });

  if (!link) {
    throw new BadRequestError("Nó não vinculado a este produto");
  }
}

export function buildProductTaxonomy(
  seedNodes: LinkedProductNode[],
  nodeById: Map<string, NodeGraphRow>
): ProductTaxonomy {
  const categoria = seedNodes.find((node) => node.type === "CATEGORIA");
  const tipo =
    categoria?.parent_id != null
      ? nodeById.get(categoria.parent_id)
      : undefined;

  return {
    tipo: tipo ? { id: tipo.id, name: tipo.name } : null,
    categoria: categoria ? toNodeRef(categoria) : null,
    marca: toNodeRefOrNull(seedNodes.find((node) => node.type === "MARCA")),
    tecnologias: seedNodes
      .filter((node) => node.type === "TECNOLOGIA")
      .map(toNodeRef),
    composicoes: seedNodes
      .filter((node) => node.type === "COMPOSICAO")
      .map(toNodeRef),
    atributos: seedNodes
      .filter((node) => node.type === "ATRIBUTO")
      .map(toNodeRef),
  };
}

function toNodeRefOrNull(
  node: LinkedProductNode | undefined
): ProductNodeRef | null {
  return node ? toNodeRef(node) : null;
}

export function buildDiscussionTabs(
  linkedNodes: LinkedProductNode[],
  productOpinionCount: number,
  nodeOpinionCounts: Map<string, number>
): ProductDiscussionTab[] {
  const tabs: ProductDiscussionTab[] = [
    {
      scope: "product",
      label: "Produto",
      opinionCount: productOpinionCount,
    },
  ];

  for (const node of linkedNodes) {
    if (!discussionTabNodeTypesSet.has(node.type)) {
      continue;
    }

    tabs.push({
      scope: "node",
      nodeId: node.id,
      type: node.type as DiscussionTabNodeType,
      label: node.name,
      opinionCount: nodeOpinionCounts.get(node.id) ?? 0,
    });
  }

  return tabs;
}

export async function ensureNameAvailable(name: string, excludeId?: string) {
  const existing = await prisma.products.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    logger.warn("Cadastro de produto rejeitado: nome já cadastrado", { name });
    throw new ConflictError("Já existe produto com este nome");
  }
}

export type ProductSearchScope = {
  tipo_id?: string;
  categoria_id?: string;
};

export async function resolveProductSearchScope(
  query: ProductSearchScope
): Promise<ProductSearchScope> {
  if (query.categoria_id) {
    const categoria = await prisma.nodes.findUnique({
      where: { id: query.categoria_id },
      select: { id: true, type: true },
    });

    if (!categoria) {
      throw new NotFoundError("Categoria não encontrada");
    }

    if (categoria.type !== "CATEGORIA") {
      throw new BadRequestError("categoria_id deve referenciar um nó do tipo CATEGORIA");
    }

    return { categoria_id: query.categoria_id };
  }

  if (query.tipo_id) {
    const tipo = await prisma.nodes.findUnique({
      where: { id: query.tipo_id },
      select: { id: true, type: true },
    });

    if (!tipo) {
      throw new NotFoundError("Tipo não encontrado");
    }

    if (tipo.type !== "TIPO") {
      throw new BadRequestError("tipo_id deve referenciar um nó do tipo TIPO");
    }

    return { tipo_id: query.tipo_id };
  }

  throw new BadRequestError("Informe tipo_id ou categoria_id");
}

export async function ensureEanAvailable(ean?: string, excludeId?: string) {
  if (!ean) {
    return;
  }

  const existing = await prisma.products.findFirst({
    where: {
      ean,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    logger.warn("Cadastro de produto rejeitado: EAN já cadastrado", { ean });
    throw new ConflictError("Já existe produto com este EAN");
  }
}

export type ProductUpdateInput = {
  name?: string;
  image_url?: string | null;
  nodeIds?: string[];
};

export type ProductChangeTaxonomy = ProductTaxonomy;

export type ProductChangeState = {
  name: string;
  image_url: string | null;
  nodeIds: string[];
  taxonomy: ProductChangeTaxonomy;
};

export async function loadProductChangeState(
  productId: string
): Promise<ProductChangeState> {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      image_url: true,
      product_nodes: {
        select: {
          node_id: true,
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

  return {
    name: product.name,
    image_url: product.image_url,
    nodeIds: product.product_nodes.map((item) => item.node_id),
    taxonomy: buildProductTaxonomy(seedNodes, nodeById),
  };
}

export async function validateProductUpdate(
  productId: string,
  input: ProductUpdateInput
): Promise<ProductChangeState> {
  const hasName = input.name !== undefined;
  const hasImage = input.image_url !== undefined;
  const hasNodeIds = input.nodeIds !== undefined;

  if (!hasName && !hasImage && !hasNodeIds) {
    throw new BadRequestError("Informe ao menos um campo para alterar");
  }

  await ensureProductExists(productId);
  const current = await loadProductChangeState(productId);

  if (hasName && input.name !== undefined) {
    await ensureNameAvailable(input.name, productId);
  }

  if (hasNodeIds && input.nodeIds !== undefined) {
    await validateProductNodeDependencies(input.nodeIds);
  }

  const nextName = hasName ? input.name! : current.name;
  const nextImage = hasImage ? input.image_url ?? null : current.image_url;
  const nextNodeIds = hasNodeIds ? [...new Set(input.nodeIds!)] : current.nodeIds;

  const unchanged =
    nextName === current.name &&
    nextImage === current.image_url &&
    arraysEqual(nextNodeIds, current.nodeIds);

  if (unchanged) {
    throw new BadRequestError("Nenhuma alteração foi informada");
  }

  return current;
}

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();

  return sortedLeft.every((value, index) => value === sortedRight[index]);
}
