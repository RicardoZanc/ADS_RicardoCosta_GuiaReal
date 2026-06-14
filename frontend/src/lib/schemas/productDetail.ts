import { z } from "zod";

export const createOpinionSchema = z.object({
  content: z.string().trim().min(1, "O conteúdo da opinião é obrigatório"),
});

export const createReplySchema = z.object({
  content: z.string().trim().min(1, "O conteúdo da resposta é obrigatório"),
});

export type CreateOpinionFormData = z.infer<typeof createOpinionSchema>;
export type CreateReplyFormData = z.infer<typeof createReplySchema>;
