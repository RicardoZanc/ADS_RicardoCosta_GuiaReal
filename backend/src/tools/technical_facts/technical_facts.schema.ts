import { z } from "zod";

export const listPendingInteractionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const createTechnicalFactSchema = z.object({
  body: z.object({
    node_id: z.uuid("ID do nó inválido"),
    fact_label: z.string().trim().min(1, "fact_label é obrigatório"),
    fact_description: z.string().trim().optional(),
    consensus_score: z.number().optional(),
    status: z.enum(["HYPOTHESIS", "VERIFIED", "DISPUTED"]).optional(),
    evidence_thread_ids: z
      .array(z.uuid("ID de thread inválido"))
      .min(1, "Informe ao menos uma thread de evidência"),
  }),
});

export const markInteractionProcessedSchema = z.object({
  params: z.object({
    thread_id: z.uuid("ID da interação inválido"),
  }),
});

export const listTechnicalFactsByNodeSchema = z.object({
  query: z.object({
    node_id: z.uuid("ID do nó inválido"),
  }),
});

export type ListPendingInteractionsQuery = z.infer<
  typeof listPendingInteractionsSchema
>["query"];

export type CreateTechnicalFactInput = z.infer<
  typeof createTechnicalFactSchema
>["body"];
