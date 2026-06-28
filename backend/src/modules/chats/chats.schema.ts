import { z } from "zod";

const messageContentSchema = z
  .string()
  .trim()
  .min(1, "O conteúdo da mensagem é obrigatório")
  .max(4000, "A mensagem deve ter no máximo 4000 caracteres");

export const createChatSchema = z.object({
  body: z.object({
    content: messageContentSchema,
  }),
});

export type CreateChatInput = z.infer<typeof createChatSchema>["body"];

export const listChatsSchema = z.object({});

export const getChatSchema = z.object({
  params: z.object({
    id: z.uuid("ID do chat inválido"),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.uuid("ID do chat inválido"),
  }),
  body: z.object({
    content: messageContentSchema,
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];

export const agentResponseSchema = z.object({
  body: z.object({
    chat_id: z.uuid("ID do chat inválido"),
    title: z
      .string()
      .trim()
      .max(255, "O título deve ter no máximo 255 caracteres"),
    assistant_message: z
      .string()
      .trim()
      .min(1, "A mensagem do assistente é obrigatória"),
  }),
});

export type AgentResponseInput = z.infer<typeof agentResponseSchema>["body"];
