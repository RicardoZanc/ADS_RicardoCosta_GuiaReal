import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
import type { CreateNodeInput } from "./nodes.schema";

type AllowedNodeType = CreateNodeInput["type"];

type DomainResolvedNodeInput = {
  name: string;
  type: AllowedNodeType;
  parent_id: string;
  wikidata_id?: string;
};

const ROOT_TYPE = "ROOT";
const TIPO_TYPE = "TIPO";

async function getRootNodeId(): Promise<string> {
  const roots = await prisma.nodes.findMany({
    where: { type: ROOT_TYPE },
    select: { id: true },
  });

  if (roots.length === 0) {
    logger.error("Criação de nó rejeitada: ROOT não encontrado");
    throw new NotFoundError("Nó ROOT não encontrado");
  }

  if (roots.length > 1) {
    logger.error("Criação de nó rejeitada: múltiplos ROOT encontrados", {
      rootCount: roots.length,
    });
    throw new BadRequestError(
      "Configuração inválida: existe mais de um nó ROOT no sistema"
    );
  }

  return roots[0].id;
}

async function ensureParentIsTipo(parentId: string): Promise<void> {
  const parentNode = await prisma.nodes.findUnique({
    where: { id: parentId },
    select: { id: true, type: true },
  });

  if (!parentNode) {
    logger.warn("Criação de categoria rejeitada: parent_id não encontrado", {
      parentId,
    });
    throw new NotFoundError("Parent ID não encontrado");
  }

  if (parentNode.type !== TIPO_TYPE) {
    logger.warn("Criação de categoria rejeitada: parent_id não é TIPO", {
      parentId,
      parentType: parentNode.type,
    });
    throw new BadRequestError(
      "Para criar CATEGORIA, o parent_id deve apontar para um nó do tipo TIPO"
    );
  }
}

export async function resolveNodeCreationDependencies(
  input: CreateNodeInput
): Promise<DomainResolvedNodeInput> {
  logger.debug("Resolução de dependências para criação de nó iniciada", {
    type: input.type,
    parentId: input.parent_id,
  });

  const rootId = await getRootNodeId();
  const flatRootChildrenTypes: AllowedNodeType[] = [
    "TIPO",
    "MARCA",
    "TECNOLOGIA",
    "COMPOSICAO",
    "ATRIBUTO",
  ];

  if (input.type === "CATEGORIA") {
    if (!input.parent_id) {
      logger.warn("Criação de categoria rejeitada: parent_id ausente");
      throw new BadRequestError(
        "Para criar CATEGORIA, o campo parent_id é obrigatório e deve referenciar um TIPO"
      );
    }

    await ensureParentIsTipo(input.parent_id);
    return {
      name: input.name,
      type: input.type,
      parent_id: input.parent_id,
      wikidata_id: input.wikidata_id,
    };
  }

  if (flatRootChildrenTypes.includes(input.type)) {
    return {
      name: input.name,
      type: input.type,
      parent_id: rootId,
      wikidata_id: input.wikidata_id,
    };
  }

  logger.warn("Criação de nó rejeitada: tipo não suportado", {
    type: input.type,
  });
  throw new BadRequestError("Tipo de nó não suportado para criação");
}
