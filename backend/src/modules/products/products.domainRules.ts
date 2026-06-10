import { prisma } from "../../lib/prisma";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";

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

export async function ensureNameAvailable(name: string) {
  const existing = await prisma.products.findFirst({
    where: { name: { equals: name.trim(), mode: "insensitive" } },
    select: { id: true },
  });

  if (existing) {
    logger.warn("Cadastro de produto rejeitado: nome já cadastrado", { name });
    throw new ConflictError("Já existe produto com este nome");
  }
}

export async function ensureEanAvailable(ean?: string) {
  if (!ean) {
    return;
  }

  const existing = await prisma.products.findUnique({
    where: { ean },
    select: { id: true },
  });

  if (existing) {
    logger.warn("Cadastro de produto rejeitado: EAN já cadastrado", { ean });
    throw new ConflictError("Já existe produto com este EAN");
  }
}
