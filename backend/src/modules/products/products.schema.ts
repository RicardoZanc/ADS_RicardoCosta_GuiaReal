import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "O nome do produto é obrigatório"),
    ean: z
      .string()
      .trim()
      .regex(/^\d{1,13}$/, "EAN deve conter apenas números e no máximo 13 dígitos")
      .optional(),
    brand_name: z.string().trim().max(100).optional(),
    image_url: z.url("URL da imagem inválida").optional(),
    nodeIds: z
      .array(z.uuid("Cada nó associado deve ser um UUID válido"))
      .min(
        2,
        "Um produto precisa de pelo menos uma CATEGORIA e uma MARCA em nodeIds"
      ),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
