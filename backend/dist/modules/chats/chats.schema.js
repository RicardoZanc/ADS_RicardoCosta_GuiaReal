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
const evidenceRefSchema = z.object({
    source_type: z.enum(["opinion", "thread"]),
    source_id: z.uuid("ID de evidência inválido"),
});
const mentionedTechnicalFactSchema = z.object({
    id: z.uuid("ID do fato técnico inválido"),
    fact_label: z.string().trim().min(1),
    evidence: z.array(evidenceRefSchema).default([]),
});
const unwrapAgentResponseBody = (value) => {
    if (!value || typeof value !== "object") {
        return value;
    }
    const body = value;
    if ("output" in body && !("chat_id" in body)) {
        return body.output;
    }
    return value;
};
const agentResponseBodySchema = z.object({
    chat_id: z.uuid("ID do chat inválido"),
    title: z
        .string()
        .trim()
        .max(255, "O título deve ter no máximo 255 caracteres"),
    assistant_message: z
        .string()
        .trim()
        .min(1, "A mensagem do assistente é obrigatória"),
    mentioned_technical_facts: z
        .array(mentionedTechnicalFactSchema)
        .optional()
        .nullable(),
    mentioned_evidences: z.array(evidenceRefSchema).optional().nullable(),
});
export const agentResponseSchema = z.object({
    body: z.preprocess(unwrapAgentResponseBody, agentResponseBodySchema),
});
export const agentProgressStepSchema = z.enum([
    "context",
    "collect",
    "query",
    "hypothesis",
    "validate",
    "respond",
]);
export const agentProgressSchema = z.object({
    body: z.object({
        chat_id: z.uuid("ID do chat inválido"),
        step: agentProgressStepSchema,
        message: z
            .string()
            .trim()
            .min(1, "A mensagem de progresso é obrigatória")
            .max(500, "A mensagem de progresso deve ter no máximo 500 caracteres"),
    }),
});
