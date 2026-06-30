import { z } from "zod";
export const listChangeRequestsSchema = z.object({
    query: z.object({
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
});
export const listMyChangeRequestsSchema = z.object({
    query: z.object({
        entity_type: z.enum(["NODE", "PRODUCT"]).optional(),
        entity_id: z.uuid("ID da entidade inválido").optional(),
    }),
});
export const updateChangeRequestSchema = z.object({
    params: z.object({
        id: z.uuid("ID da solicitação inválido"),
    }),
    body: z.object({
        status: z.enum(["APPROVED", "REJECTED"]),
        rejection_reason: z.string().trim().max(2000).optional(),
    }),
});
