import { ConflictError } from "../../lib/errors/BaseError";
import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";
import {
  dispatchN8nChatWebhook,
  type ChatHistoryMessage,
} from "../../lib/n8nChatWebhook";
import { chatRoomId, getIo } from "../../lib/socket";
import {
  assertChatBelongsToUser,
  assertChatExists,
} from "./chats.domainRules";
import type {
  AgentProgressInput,
  AgentResponseInput,
  CreateChatInput,
  SendMessageInput,
} from "./chats.schema";

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

type EvidenceRef = {
  source_type: "opinion" | "thread";
  source_id: string;
};

type MentionedTechnicalFact = {
  id: string;
  fact_label: string;
  evidence: EvidenceRef[];
};

const evidenceKey = (item: EvidenceRef) =>
  `${item.source_type}:${item.source_id}`;

const dedupeEvidence = (items: EvidenceRef[]): EvidenceRef[] => {
  const seen = new Set<string>();
  const unique: EvidenceRef[] = [];

  for (const item of items) {
    const key = evidenceKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique;
};

const getChatContextMessageLimit = (): number => {
  const parsed = Number(process.env.CHAT_CONTEXT_MESSAGE_LIMIT ?? 20);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 20;
};

const getMessageHistoryForAgent = async (
  chatId: string,
  excludeMessageId: string,
  limit = getChatContextMessageLimit()
): Promise<ChatHistoryMessage[]> => {
  const messages = await prisma.chat_messages.findMany({
    where: {
      chat_id: chatId,
      id: { not: excludeMessageId },
    },
    orderBy: { created_at: "desc" },
    take: limit,
    select: {
      sender: true,
      content: true,
    },
  });

  return messages.reverse();
};

const resolveMentionedEvidence = (
  input: AgentResponseInput
): {
  mentioned_technical_facts: MentionedTechnicalFact[] | null;
  mentioned_evidences: EvidenceRef[] | null;
} => {
  const facts = input.mentioned_technical_facts ?? null;

  if (!facts || facts.length === 0) {
    return {
      mentioned_technical_facts: null,
      mentioned_evidences: input.mentioned_evidences?.length
        ? dedupeEvidence(input.mentioned_evidences)
        : null,
    };
  }

  const derivedEvidences = dedupeEvidence(
    facts.flatMap((fact) => fact.evidence)
  );

  return {
    mentioned_technical_facts: facts,
    mentioned_evidences: derivedEvidences,
  };
};

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
    message_history: [],
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
  const { mentioned_technical_facts, mentioned_evidences } =
    resolveMentionedEvidence(input);

  const result = await prisma.$transaction(async (tx) => {
    const message = await tx.chat_messages.create({
      data: {
        chat_id: input.chat_id,
        sender: "ASSISTANT",
        content: input.assistant_message,
        mentioned_technical_facts:
          mentioned_technical_facts === null
            ? undefined
            : mentioned_technical_facts,
        mentioned_evidences:
          mentioned_evidences === null ? undefined : mentioned_evidences,
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

const listByUser = async (userId: string) => {
  const chats = await prisma.chats.findMany({
    where: { user_id: userId },
    select: chatSelect,
    orderBy: { created_at: "desc" },
  });

  return { data: chats };
};

const getById = async (userId: string, chatId: string) => {
  await assertChatBelongsToUser(chatId, userId);

  const chat = await prisma.chats.findUniqueOrThrow({
    where: { id: chatId },
    select: {
      ...chatSelect,
      chat_messages: {
        select: messageSelect,
        orderBy: { created_at: "asc" },
      },
    },
  });

  const { chat_messages, ...chatData } = chat;

  return {
    ...chatData,
    messages: chat_messages,
  };
};

const sendMessage = async (
  userId: string,
  chatId: string,
  input: SendMessageInput
) => {
  await assertChatBelongsToUser(chatId, userId);

  const message = await prisma.chat_messages.create({
    data: {
      chat_id: chatId,
      sender: "USER",
      content: input.content,
    },
    select: messageSelect,
  });

  const message_history = await getMessageHistoryForAgent(
    chatId,
    message.id
  );

  dispatchN8nChatWebhook({
    chat_id: chatId,
    user_id: userId,
    user_message: input.content,
    should_name_conversation: false,
    message_history,
  });

  logger.debug("Chat: mensagem do usuário persistida", {
    chatId,
    userId,
    messageId: message.id,
  });

  return { message };
};

const retryAssistantResponse = async (userId: string, chatId: string) => {
  await assertChatBelongsToUser(chatId, userId);

  const chat = await prisma.chats.findUniqueOrThrow({
    where: { id: chatId },
    select: chatSelect,
  });

  const lastMessage = await prisma.chat_messages.findFirst({
    where: { chat_id: chatId },
    orderBy: { created_at: "desc" },
    select: messageSelect,
  });

  if (!lastMessage || lastMessage.sender !== "USER") {
    throw new ConflictError("Não há mensagem pendente para reenviar");
  }

  const message_history = await getMessageHistoryForAgent(
    chatId,
    lastMessage.id
  );

  dispatchN8nChatWebhook({
    chat_id: chatId,
    user_id: userId,
    user_message: lastMessage.content,
    should_name_conversation: chat.title === null,
    message_history,
  });

  logger.debug("Chat: reenvio do agente disparado", { chatId, userId });

  return { ok: true as const };
};

const emitAgentProgress = async (input: AgentProgressInput) => {
  await assertChatExists(input.chat_id);

  const room = chatRoomId(input.chat_id);
  getIo().to(room).emit("chat:agent_progress", {
    chatId: input.chat_id,
    step: input.step,
    message: input.message,
  });

  logger.debug("Chat: progresso do agente emitido via socket", {
    chatId: input.chat_id,
    step: input.step,
  });
};

export const chatsService = {
  createWithFirstMessage,
  handleAgentResponse,
  emitAgentProgress,
  listByUser,
  getById,
  sendMessage,
  retryAssistantResponse,
};
