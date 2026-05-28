import { z } from "zod";
const allowedNodeTypes = [
    "CATEGORIA",
    "MARCA",
    "TECNOLOGIA",
    "COMPOSICAO",
    "ATRIBUTO",
];
export const createNodeSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "O nome do nó é obrigatório"),
        type: z.enum(allowedNodeTypes),
        parent_id: z.uuid("Parent ID inválido").optional(),
        wikidata_id: z.string().trim().max(50).optional(),
    }),
});
