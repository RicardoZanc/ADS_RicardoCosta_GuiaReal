import { z } from "zod";

export const listFeedSchema = z.object({
  query: z.object({
    simplified: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const listSimplifiedFeedSchema = z.object({
  query: z.object({
    simplified: z.literal("true"),
    limit: z.coerce.number().int().min(1).max(20).default(8),
  }),
});

export type ListFeedQuery = z.infer<typeof listFeedSchema>["query"];
export type ListSimplifiedFeedQuery = z.infer<
  typeof listSimplifiedFeedSchema
>["query"];
