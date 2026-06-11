import { z } from "zod";
const opinionBodySchema = z.object({
    title: z.string().trim().max(255).optional(),
    content: z.string().trim().min(1, "O conteúdo da opinião é obrigatório"),
});
export const createProductOpinionSchema = z.object({
    params: z.object({
        product_id: z.uuid("ID do produto inválido"),
    }),
    body: opinionBodySchema,
});
export const createNodeOpinionSchema = z.object({
    params: z.object({
        node_id: z.uuid("ID do nó inválido"),
    }),
    body: opinionBodySchema,
});
export const createOpinionThreadSchema = z.object({
    params: z.object({
        opinion_id: z.uuid("ID da opinião inválido"),
    }),
    body: z.object({
        content: z.string().trim().min(1, "O conteúdo da resposta é obrigatório"),
    }),
});
