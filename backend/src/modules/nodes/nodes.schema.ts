import { z } from "zod";

export const searchableNodeTypes = [
  "TIPO",
  "CATEGORIA",
  "MARCA",
  "TECNOLOGIA",
  "COMPOSICAO",
  "ATRIBUTO",
] as const;

export const createNodeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "O nome do nó é obrigatório"),
    type: z.enum(searchableNodeTypes),
    parent_id: z.uuid("Parent ID inválido").optional(),
    wikidata_id: z.string().trim().max(50).optional(),
  }),
});

export const listNodesSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1).optional(),
    type: z.enum(searchableNodeTypes).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateNodeInput = z.infer<typeof createNodeSchema>["body"];
export type ListNodesQuery = z.infer<typeof listNodesSchema>["query"];
