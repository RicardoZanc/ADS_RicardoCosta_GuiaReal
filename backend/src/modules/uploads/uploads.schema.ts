import { z } from "zod";

export const ALLOWED_PRODUCT_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type ProductImageContentType =
  (typeof ALLOWED_PRODUCT_IMAGE_CONTENT_TYPES)[number];

export const createProductImageUploadSchema = z.object({
  body: z.object({
    contentType: z.enum(ALLOWED_PRODUCT_IMAGE_CONTENT_TYPES, {
      message: "Tipo de imagem não suportado",
    }),
  }),
});

export const createProfileImageUploadSchema = z.object({
  body: z.object({
    contentType: z.enum(ALLOWED_PRODUCT_IMAGE_CONTENT_TYPES, {
      message: "Tipo de imagem não suportado",
    }),
  }),
});

export const createNodeImageUploadSchema = z.object({
  body: z.object({
    contentType: z.enum(ALLOWED_PRODUCT_IMAGE_CONTENT_TYPES, {
      message: "Tipo de imagem não suportado",
    }),
  }),
});

export type CreateProductImageUploadInput = z.infer<
  typeof createProductImageUploadSchema
>["body"];
