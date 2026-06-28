import { apiClient } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import type { ImageUploadResponse } from "@/lib/types/uploads";

export const MAX_IMAGE_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

type AllowedContentType = (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];

function isAllowedContentType(type: string): type is AllowedContentType {
  return (ALLOWED_IMAGE_CONTENT_TYPES as readonly string[]).includes(type);
}

export function validateImageFile(file: File): void {
  if (!file.type.startsWith("image/") || !isAllowedContentType(file.type)) {
    throw new ApiError(
      400,
      "Formato de imagem não suportado. Use JPEG, PNG, WebP ou GIF."
    );
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new ApiError(400, "A imagem deve ter no máximo 50 MB.");
  }
}

export async function uploadImageFile(
  file: File,
  endpoint: string
): Promise<string> {
  validateImageFile(file);

  const uploadTarget = await apiClient<ImageUploadResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify({ contentType: file.type }),
  });

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
