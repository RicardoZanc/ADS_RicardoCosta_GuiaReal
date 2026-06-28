import { z } from "zod";

export const getProductNodesSchema = z.object({
  params: z.object({
    product_id: z.uuid("ID do produto inválido"),
  }),
});
