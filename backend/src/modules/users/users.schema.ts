import { z } from "zod";

export const getUserByUsernameSchema = z.object({
  params: z.object({
    username: z.string().min(1).max(50),
  }),
});

export const listUserInteractionsSchema = z.object({
  params: z.object({
    username: z.string().min(1).max(50),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const updateUserMeSchema = z.object({
  body: z.object({
    avatar_url: z.string().url().nullable(),
  }),
});

export type ListUserInteractionsQuery = z.infer<
  typeof listUserInteractionsSchema
>["query"];

export type UpdateUserMeInput = z.infer<typeof updateUserMeSchema>["body"];
