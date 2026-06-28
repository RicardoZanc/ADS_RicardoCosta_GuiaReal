import { z } from "zod";
export const ALLOWED_PRODUCT_IMAGE_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];
export const createProductImageUploadSchema = z.object({
    body: z.object({
        contentType: z.enum(ALLOWED_PRODUCT_IMAGE_CONTENT_TYPES, {
            message: "Tipo de imagem não suportado",
        }),
    }),
});
