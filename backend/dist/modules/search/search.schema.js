import { z } from "zod";
export const globalSearchSchema = z.object({
    query: z.object({
        q: z.string().trim().min(1, "O termo de busca é obrigatório"),
        limit_nodes: z.coerce.number().int().min(1).max(100).default(20),
        limit_products: z.coerce.number().int().min(1).max(50).default(10),
    }),
});
