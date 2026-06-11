import { z } from "zod";
export const searchableNodeTypes = [
    "TIPO",
    "CATEGORIA",
    "MARCA",
    "TECNOLOGIA",
    "COMPOSICAO",
    "ATRIBUTO",
];
export const createNodeSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "O nome do nó é obrigatório"),
        type: z.enum(searchableNodeTypes),
        parent_id: z.uuid("Parent ID inválido").optional(),
        wikidata_id: z.string().trim().max(50).optional(),
    }),
});
export const listNodesSchema = z.object({
    query: z
        .object({
        q: z.string().trim().min(1).optional(),
        type: z.enum(searchableNodeTypes).optional(),
        tipo_id: z.uuid("tipo_id inválido").optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
        .superRefine((data, ctx) => {
        if (data.tipo_id && data.type && data.type !== "CATEGORIA") {
            ctx.addIssue({
                code: "custom",
                message: "Quando tipo_id é informado, type deve ser CATEGORIA ou omitido",
                path: ["type"],
            });
        }
    }),
});
export const updateNodeSchema = z.object({
    params: z.object({
        id: z.uuid("ID do nó inválido"),
    }),
    body: z.object({
        name: z.string().trim().min(1, "O nome do nó é obrigatório"),
    }),
});
