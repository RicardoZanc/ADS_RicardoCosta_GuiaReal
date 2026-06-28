import { randomUUID } from "node:crypto";
import { BadRequestError } from "../../lib/errors/BaseError";
import {
  buildProfileImagePublicUrl,
  buildProductImagePublicUrl,
  getProfilesBucketName,
  getProductsBucketName,
  getSupabaseAdmin,
} from "../../lib/supabase";
import type { ProductImageContentType } from "./uploads.schema";

const CONTENT_TYPE_EXTENSION: Record<ProductImageContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function buildObjectPath(userId: string, contentType: ProductImageContentType) {
  const extension = CONTENT_TYPE_EXTENSION[contentType];
  return `${userId}/${randomUUID()}.${extension}`;
}

async function createSignedUpload(
  userId: string,
  contentType: ProductImageContentType,
  bucket: string,
  buildPublicUrl: (path: string) => string
) {
  const path = buildObjectPath(userId, contentType);

  const { data, error } = await getSupabaseAdmin().storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new BadRequestError(
      error?.message ?? "Não foi possível gerar URL de upload da imagem"
    );
  }

  return {
    path: data.path,
    signedUrl: data.signedUrl,
    token: data.token,
    publicUrl: buildPublicUrl(data.path),
  };
}

const createProductImageUpload = async (
  userId: string,
  contentType: ProductImageContentType
) => {
  return createSignedUpload(
    userId,
    contentType,
    getProductsBucketName(),
    buildProductImagePublicUrl
  );
};

const createProfileImageUpload = async (
  userId: string,
  contentType: ProductImageContentType
) => {
  return createSignedUpload(
    userId,
    contentType,
    getProfilesBucketName(),
    buildProfileImagePublicUrl
  );
};

export const uploadsService = {
  createProductImageUpload,
  createProfileImageUpload,
};
