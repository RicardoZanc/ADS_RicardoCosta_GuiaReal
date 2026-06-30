import { z } from "zod";
const evidenceRefSchema = z.object({
    source_type: z.enum(["opinion", "thread"]),
    source_id: z.uuid("ID da evidência inválido"),
});
export const previewEvidenceSchema = z.object({
    body: z.object({
        evidence: z.array(evidenceRefSchema).min(1).max(50),
    }),
});
