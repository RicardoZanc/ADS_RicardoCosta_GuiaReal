import { z } from "zod";
import { isAllowedProductImageUrl } from "../../lib/supabase";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "O nome do produto é obrigatório"),
    ean: z
      .string()
      .trim()
      .regex(/^\d{1,13}$/, "EAN deve conter apenas números e no máximo 13 dígitos")
      .optional(),
    brand_name: z.string().trim().max(100).optional(),
    image_url: z
      .url("URL da imagem inválida")
      .optional()
      .refine(
        (url) => !url || isAllowedProductImageUrl(url),
        "URL da imagem deve ser do bucket de produtos do Supabase"
      ),
    nodeIds: z
      .array(z.uuid("Cada nó associado deve ser um UUID válido"))
      .min(
        2,
        "Um produto precisa de pelo menos uma CATEGORIA e uma MARCA em nodeIds"
      ),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];

export const getProductSchema = z.object({
  params: z.object({
    id: z.uuid("ID do produto inválido"),
  }),
});

export const listProductOpinionsSchema = z.object({
  params: z.object({
    id: z.uuid("ID do produto inválido"),
  }),
  query: z
    .object({
      scope: z.enum(["product", "node"]).default("product"),
      node_id: z.uuid("ID do nó inválido").optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .superRefine((data, ctx) => {
      if (data.scope === "node" && !data.node_id) {
        ctx.addIssue({
          code: "custom",
          message: "node_id é obrigatório quando scope é node",
          path: ["node_id"],
        });
      }
    }),
});

export type GetProductParams = z.infer<typeof getProductSchema>["params"];
export type ListProductOpinionsQuery = z.infer<
  typeof listProductOpinionsSchema
>["query"];

const productSearchScopeSchema = z
  .object({
    tipo_id: z.uuid("tipo_id inválido").optional(),
    categoria_id: z.uuid("categoria_id inválido").optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.tipo_id && !data.categoria_id) {
      ctx.addIssue({
        code: "custom",
        message: "Informe tipo_id ou categoria_id",
        path: ["tipo_id"],
      });
    }
  });

const nodeIdsQuerySchema = z.preprocess((value) => {
  if (value == null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value;
}, z.array(z.uuid("Cada node_id deve ser um UUID válido")));

export const facetTypes = ["TECNOLOGIA", "COMPOSICAO", "ATRIBUTO"] as const;

export const productFacetsSchema = z.object({
  query: productSearchScopeSchema.extend({
    facet_type: z.enum(facetTypes).optional(),
    q: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(15),
  }),
});

export const productSearchSchema = z.object({
  query: productSearchScopeSchema.extend({
    node_ids: nodeIdsQuerySchema.default([]),
    q: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type ProductFacetsQuery = z.infer<typeof productFacetsSchema>["query"];
export type ProductSearchQuery = z.infer<typeof productSearchSchema>["query"];

export type ResolvedProductSearchScope = {
  tipo_id?: string;
  categoria_id?: string;
};
