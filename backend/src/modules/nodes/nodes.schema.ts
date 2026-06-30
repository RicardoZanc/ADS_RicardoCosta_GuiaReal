import { z } from "zod";
import { isAllowedNodeImageUrl } from "../../lib/supabase";

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
    image_url: z
      .url("URL da imagem inválida")
      .optional()
      .refine(
        (url) => !url || isAllowedNodeImageUrl(url),
        "URL da imagem deve ser do bucket de nós do Supabase"
      ),
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
          message:
            "Quando tipo_id é informado, type deve ser CATEGORIA ou omitido",
          path: ["type"],
        });
      }
    }),
});

export const updateNodeSchema = z.object({
  params: z.object({
    id: z.uuid("ID do nó inválido"),
  }),
  body: z
    .object({
      name: z.string().trim().min(1, "O nome do nó é obrigatório").optional(),
      image_url: z
        .union([
          z
            .url("URL da imagem inválida")
            .refine(
              (url) => isAllowedNodeImageUrl(url),
              "URL da imagem deve ser do bucket de nós do Supabase"
            ),
          z.null(),
        ])
        .optional(),
    })
    .refine((data) => data.name !== undefined || data.image_url !== undefined, {
      message: "Informe ao menos um campo para alterar",
    }),
});

export const getNodeSchema = z.object({
  params: z.object({
    id: z.uuid("ID do nó inválido"),
  }),
});

export const listNodeOpinionsSchema = z.object({
  params: z.object({
    id: z.uuid("ID do nó inválido"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateNodeInput = z.infer<typeof createNodeSchema>["body"];
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>["body"];
export type ListNodesQuery = z.infer<typeof listNodesSchema>["query"];
export type ListNodeOpinionsQuery = z.infer<
  typeof listNodeOpinionsSchema
>["query"];

export type ResolvedNodeSearchQuery = ListNodesQuery & {
  parent_id?: string;
};
