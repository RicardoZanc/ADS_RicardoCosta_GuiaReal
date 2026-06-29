import { z } from "zod";
import { REPORT_REASONS } from "./reports.domainRules";
export const createReportSchema = z.object({
    body: z.object({
        target_type: z.enum(["opinion", "thread"]),
        target_id: z.uuid("ID do alvo inválido"),
        reason: z.enum(REPORT_REASONS),
    }),
});
export const listReportsSchema = z.object({
    query: z.object({
        status: z
            .enum(["PENDING", "UNDER_REVIEW", "RESOLVED", "REJECTED"])
            .optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
});
export const updateReportSchema = z.object({
    params: z.object({
        id: z.uuid("ID da denúncia inválido"),
    }),
    body: z.object({
        status: z.enum(["UNDER_REVIEW", "RESOLVED", "REJECTED"]),
        admin_notes: z.string().trim().max(2000).optional(),
    }),
});
