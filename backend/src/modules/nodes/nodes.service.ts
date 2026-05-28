import { prisma } from "../../lib/prisma";
import { ConflictError } from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
import type { CreateNodeInput } from "./nodes.schema";
import { resolveNodeCreationDependencies } from "./nodes.domainRules";
import type { node_type } from "../../generated/prisma/enums";

type PrismaErrorWithCode = {
  code?: string;
  meta?: { target?: unknown };
};

function isUniqueConstraintError(error: unknown): error is PrismaErrorWithCode {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as PrismaErrorWithCode).code === "P2002"
  );
}

const create = async (input: CreateNodeInput) => {
  logger.debug("Criação de nó: payload recebido", {
    type: input.type,
    name: input.name,
  });

  const data = await resolveNodeCreationDependencies(input);

  try {
    const node = await prisma.nodes.create({
      data: {
        ...data,
        type: data.type as node_type,
      },
      select: {
        id: true,
        name: true,
        type: true,
        parent_id: true,
        wikidata_id: true,
        created_at: true,
      },
    });

    logger.debug("Criação de nó: persistência concluída", {
      nodeId: node.id,
      type: node.type,
    });

    return node;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      logger.warn("Criação de nó rejeitada: conflito de unicidade", {
        type: input.type,
        name: input.name,
      });
      throw new ConflictError("Já existe um nó com os mesmos dados únicos");
    }
    throw error;
  }
};

export const nodesService = {
  create,
};
