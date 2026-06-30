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
    query: z
        .object({
        node_id: z.uuid("ID do nó inválido").optional(),
        status: z.enum(["HYPOTHESIS", "VERIFIED", "DISPUTED"]).optional(),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    })
        .refine((q) => q.node_id !== undefined || q.status !== undefined, {
        message: "Informe node_id e/ou status",
    }),
});
export const addEvidenceSchema = z.object({
    params: z.object({
        id: z.uuid("ID do fato inválido"),
    }),
    body: z.object({
        evidence: z
            .array(evidenceRefSchema)
            .min(1, "Informe ao menos uma evidência"),
        consensus_score: z.number().min(0).max(1).optional(),
        status: z.enum(["HYPOTHESIS", "VERIFIED", "DISPUTED"]).optional(),
    }),
});
export const listByEvidenceSchema = z.object({
    params: z.object({
        source_type: evidenceSourceTypeSchema,
        source_id: z.uuid("ID da fonte inválido"),
    }),
});
export const updateTechnicalFactSchema = z.object({
    params: z.object({
        id: z.uuid("ID do fato inválido"),
    }),
    body: z
        .object({
        fact_label: z.string().trim().min(1).optional(),
        fact_description: z.string().trim().optional(),
        consensus_score: z.number().min(0).max(1).optional(),
        status: z.enum(["HYPOTHESIS", "VERIFIED", "DISPUTED"]).optional(),
    })
        .refine((body) => body.fact_label !== undefined ||
        body.fact_description !== undefined ||
        body.consensus_score !== undefined ||
        body.status !== undefined, { message: "Informe ao menos um campo para atualizar" }),
});
export const removeEvidenceSchema = z.object({
    params: z.object({
        fact_id: z.uuid("ID do fato inválido"),
        source_type: evidenceSourceTypeSchema,
        source_id: z.uuid("ID da fonte inválido"),
    }),
});
