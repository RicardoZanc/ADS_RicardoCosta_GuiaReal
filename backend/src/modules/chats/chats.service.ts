import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";
import { dispatchN8nChatWebhook } from "../../lib/n8nChatWebhook";
import { chatRoomId, getIo } from "../../lib/socket";
import { assertChatExists } from "./chats.domainRules";
import type { AgentResponseInput, CreateChatInput } from "./chats.schema";

const chatSelect = {
  id: true,
  user_id: true,
  title: true,
  created_at: true,
} as const;

const messageSelect = {
  id: true,
  chat_id: true,
  sender: true,
  content: true,
  mentioned_evidences: true,
  mentioned_technical_facts: true,
  created_at: true,
} as const;

const createWithFirstMessage = async (
  userId: string,
  input: CreateChatInput
) => {
  logger.debug("Chat: payload de criação recebido", { userId });

  const result = await prisma.$transaction(async (tx) => {
    const chat = await tx.chats.create({
      data: {
        user_id: userId,
        title: null,
      },
      select: chatSelect,
    });

    const message = await tx.chat_messages.create({
      data: {
        chat_id: chat.id,
        sender: "USER",
        content: input.content,
      },
      select: messageSelect,
    });

    return { chat, message };
  });

  dispatchN8nChatWebhook({
    chat_id: result.chat.id,
    user_id: userId,
    user_message: input.content,
    should_name_conversation: true,
  });

  logger.debug("Chat: persistência concluída", {
    chatId: result.chat.id,
    userId,
  });

  return {
    ...result.chat,
    messages: [result.message],
  };
};

const handleAgentResponse = async (input: AgentResponseInput) => {
  logger.debug("Chat: resposta do agente recebida", { chatId: input.chat_id });

  await assertChatExists(input.chat_id);

  const shouldUpdateTitle = input.title.length > 0;

  const result = await prisma.$transaction(async (tx) => {
    const message = await tx.chat_messages.create({
      data: {
        chat_id: input.chat_id,
        sender: "ASSISTANT",
        content: input.assistant_message,
      },
      select: messageSelect,
    });

    const chat = shouldUpdateTitle
      ? await tx.chats.update({
          where: { id: input.chat_id },
          data: { title: input.title },
          select: chatSelect,
        })
      : await tx.chats.findUniqueOrThrow({
          where: { id: input.chat_id },
          select: chatSelect,
        });

    return { chat, message };
  });

  const room = chatRoomId(input.chat_id);
  const io = getIo();

  if (shouldUpdateTitle) {
    io.to(room).emit("chat:title_updated", {
      chatId: input.chat_id,
      title: result.chat.title,
    });
  }

  io.to(room).emit("chat:assistant_message", {
    chatId: input.chat_id,
    message: result.message,
  });

  logger.debug("Chat: resposta do agente persistida e emitida via socket", {
    chatId: input.chat_id,
    messageId: result.message.id,
  });

  return {
    chat_id: result.chat.id,
    title: result.chat.title,
    message: result.message,
  };
};

export const chatsService = {
  createWithFirstMessage,
  handleAgentResponse,
};
