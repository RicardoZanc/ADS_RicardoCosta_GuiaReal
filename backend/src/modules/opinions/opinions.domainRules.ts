import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../lib/errors/BaseError";

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

export async function ensureThreadBelongsToOpinion(
  parentInteractionId: string,
  opinionId: string
) {
  const parentThread = await prisma.discussion_threads.findUnique({
    where: { id: parentInteractionId },
    select: { id: true, opinion_id: true },
  });

  if (!parentThread) {
    throw new BadRequestError("Interação pai não encontrada");
  }

  if (parentThread.opinion_id !== opinionId) {
    throw new BadRequestError(
      "A interação pai não pertence a esta opinião"
    );
  }
}

export async function ensureThreadExists(threadId: string) {
  const thread = await prisma.discussion_threads.findUnique({
    where: { id: threadId },
    select: { id: true },
  });

  if (!thread) {
    throw new NotFoundError("Interação não encontrada");
  }
}
