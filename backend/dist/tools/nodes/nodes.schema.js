import { z } from "zod";
import { searchableNodeTypes } from "../../modules/nodes/nodes.schema";
export const searchNodesSchema = z.object({
    query: z.object({
        q: z.string().trim().min(1, "q é obrigatório"),
        type: z.enum(searchableNodeTypes).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
});
