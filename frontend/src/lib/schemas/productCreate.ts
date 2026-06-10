import { z } from "zod";

export const productModelSchema = z.object({
  name: z.string().trim().min(1, "O nome do produto é obrigatório"),
});

export type ProductModelFormData = z.infer<typeof productModelSchema>;
