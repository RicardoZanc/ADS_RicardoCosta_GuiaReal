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
    parent_interaction_id: z
      .uuid("ID da interação pai inválido")
      .optional()
      .nullable(),
  }),
});

export type CreateProductOpinionInput = z.infer<
  typeof createProductOpinionSchema
>["body"];
export type CreateNodeOpinionInput = z.infer<
  typeof createNodeOpinionSchema
>["body"];
export type CreateOpinionThreadInput = z.infer<
  typeof createOpinionThreadSchema
>["body"];

export const reactionActionSchema = z.enum([
  "like",
  "dislike",
  "remove_like",
  "remove_dislike",
]);

export const reactToOpinionSchema = z.object({
  params: z.object({
    opinion_id: z.uuid("ID da opinião inválido"),
  }),
  body: z.object({
    action: reactionActionSchema,
  }),
});

export const reactToThreadSchema = z.object({
  params: z.object({
    thread_id: z.uuid("ID da interação inválido"),
  }),
  body: z.object({
    action: reactionActionSchema,
  }),
});

export type ReactionAction = z.infer<typeof reactionActionSchema>;
