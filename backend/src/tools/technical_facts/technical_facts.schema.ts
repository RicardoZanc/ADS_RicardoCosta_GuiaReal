import { z } from "zod";

export const evidenceSourceTypeSchema = z.enum(["opinion", "thread"]);

export const evidenceRefSchema = z.object({
  source_type: evidenceSourceTypeSchema,
  source_id: z.uuid("ID de evidência inválido"),
});

export const listPendingQueueSchema = z.object({
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
    evidence: z
      .array(evidenceRefSchema)
      .min(1, "Informe ao menos uma evidência"),
  }),
});

export const markQueueItemProcessedSchema = z.object({
  params: z.object({
    source_type: evidenceSourceTypeSchema,
    source_id: z.uuid("ID da fonte inválido"),
  }),
});

export const listTechnicalFactsByNodeSchema = z.object({
  query: z.object({
    node_id: z.uuid("ID do nó inválido"),
  }),
});

export type EvidenceRef = z.infer<typeof evidenceRefSchema>;
export type EvidenceSourceType = z.infer<typeof evidenceSourceTypeSchema>;

export type ListPendingQueueQuery = z.infer<
  typeof listPendingQueueSchema
>["query"];

export type CreateTechnicalFactInput = z.infer<
  typeof createTechnicalFactSchema
>["body"];

export type MarkQueueItemProcessedParams = z.infer<
  typeof markQueueItemProcessedSchema
>["params"];
