import { z } from "zod";
import {
  MAX_ADMIN_REQUEST_MESSAGE_LENGTH,
  MIN_ADMIN_REQUEST_MESSAGE_LENGTH,
} from "./adminRequests.domainRules";

export const createAdminRequestSchema = z.object({
  body: z.object({
    message: z
      .string()
      .trim()
      .min(
        MIN_ADMIN_REQUEST_MESSAGE_LENGTH,
        `A motivação deve ter pelo menos ${MIN_ADMIN_REQUEST_MESSAGE_LENGTH} caracteres`
      )
      .max(
        MAX_ADMIN_REQUEST_MESSAGE_LENGTH,
        `A motivação deve ter no máximo ${MAX_ADMIN_REQUEST_MESSAGE_LENGTH} caracteres`
      ),
  }),
});

export const listAdminRequestsSchema = z.object({
  query: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const updateAdminRequestSchema = z.object({
  params: z.object({
    id: z.uuid("ID da solicitação inválido"),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejection_reason: z
      .string()
      .trim()
      .max(MAX_ADMIN_REQUEST_MESSAGE_LENGTH)
      .optional(),
  }),
});

export type CreateAdminRequestInput = z.infer<
  typeof createAdminRequestSchema
>["body"];
export type ListAdminRequestsQuery = z.infer<
  typeof listAdminRequestsSchema
>["query"];
export type UpdateAdminRequestInput = z.infer<
  typeof updateAdminRequestSchema
>["body"];
