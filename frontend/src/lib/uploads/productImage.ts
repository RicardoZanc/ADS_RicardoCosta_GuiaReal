import { apiClient } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import type { ProductImageUploadResponse } from "@/lib/types/products";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

function isAllowedContentType(type: string): type is AllowedContentType {
  return (ALLOWED_CONTENT_TYPES as readonly string[]).includes(type);
}

function validateProductImageFile(file: File): void {
  if (!file.type.startsWith("image/") || !isAllowedContentType(file.type)) {
    throw new ApiError(
      400,
      "Formato de imagem não suportado. Use JPEG, PNG, WebP ou GIF."
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ApiError(400, "A imagem deve ter no máximo 50 MB.");
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  validateProductImageFile(file);

  const uploadTarget = await apiClient<ProductImageUploadResponse>(
    "/uploads/product-image",
    {
      method: "POST",
      body: JSON.stringify({ contentType: file.type }),
    }
  );

  let response: Response;
  try {
    response = await fetch(uploadTarget.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
  } catch {
    throw new ApiError(0, "Não foi possível enviar a imagem. Tente novamente.");
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      "Não foi possível enviar a imagem para o armazenamento."
    );
  }

  return uploadTarget.publicUrl;
}
