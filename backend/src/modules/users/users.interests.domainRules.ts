import { prisma } from "../../lib/prisma";
import { BadRequestError } from "../../lib/errors/BaseError";
import type { node_type } from "../../generated/prisma/enums";

const allowedInterestNodeTypes = new Set<node_type>(["TIPO", "CATEGORIA"]);

export const MAX_USER_INTERESTS = 30;

export function dedupeNodeIds(nodeIds: string[]): string[] {
  return [...new Set(nodeIds)];
}

export async function assertValidInterestNodeIds(nodeIds: string[]): Promise<void> {
  if (nodeIds.length === 0) {
    return;
  }

  if (nodeIds.length > MAX_USER_INTERESTS) {
    throw new BadRequestError(
      `É permitido selecionar no máximo ${MAX_USER_INTERESTS} interesses`
    );
  }

  const uniqueNodeIds = dedupeNodeIds(nodeIds);

  const nodes = await prisma.nodes.findMany({
    where: { id: { in: uniqueNodeIds } },
    select: { id: true, type: true, name: true },
  });

  if (nodes.length !== uniqueNodeIds.length) {
    throw new BadRequestError("Um ou mais interesses informados não existem");
  }

  const invalidNode = nodes.find((node) => !allowedInterestNodeTypes.has(node.type));
  if (invalidNode) {
    throw new BadRequestError(
      `O nó "${invalidNode.name}" não é um interesse válido (apenas TIPO e CATEGORIA)`
    );
  }
}
