import { prisma } from "../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../lib/errors/BaseError";

export async function assertChatExists(chatId: string): Promise<void> {
  const chat = await prisma.chats.findUnique({
    where: { id: chatId },
    select: { id: true },
  });

  if (!chat) {
    throw new NotFoundError("Chat não encontrado");
  }
}

export async function assertChatBelongsToUser(
  chatId: string,
  userId: string
): Promise<void> {
  const chat = await prisma.chats.findUnique({
    where: { id: chatId },
    select: { id: true, user_id: true },
  });

  if (!chat) {
    throw new NotFoundError("Chat não encontrado");
  }

  if (chat.user_id !== userId) {
    throw new ForbiddenError("Acesso negado a este chat");
  }
}
