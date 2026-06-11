import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors/BaseError";

export async function ensureProductExists(productId: string) {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new NotFoundError("Produto não encontrado");
  }
}

export async function ensureNodeExists(nodeId: string) {
  const node = await prisma.nodes.findUnique({
    where: { id: nodeId },
    select: { id: true },
  });

  if (!node) {
    throw new NotFoundError("Nó não encontrado");
  }
}

export async function ensureOpinionExists(opinionId: string) {
  const opinion = await prisma.opinions.findUnique({
    where: { id: opinionId },
    select: { id: true },
  });

  if (!opinion) {
    throw new NotFoundError("Opinião não encontrada");
  }
}
