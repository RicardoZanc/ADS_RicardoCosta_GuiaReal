import { randomUUID } from "node:crypto";
import { BadRequestError } from "../../lib/errors/BaseError";
import { buildProfileImagePublicUrl, buildProductImagePublicUrl, getProfilesBucketName, getProductsBucketName, getSupabaseAdmin, } from "../../lib/supabase";
const CONTENT_TYPE_EXTENSION = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
};
function buildObjectPath(userId, contentType) {
    const extension = CONTENT_TYPE_EXTENSION[contentType];
    return `${userId}/${randomUUID()}.${extension}`;
}
async function createSignedUpload(userId, contentType, bucket, buildPublicUrl) {
    const path = buildObjectPath(userId, contentType);
    const { data, error } = await getSupabaseAdmin().storage
        .from(bucket)
        .createSignedUploadUrl(path);
    if (error || !data) {
        throw new BadRequestError(error?.message ?? "Não foi possível gerar URL de upload da imagem");
    }
    return {
        path: data.path,
        signedUrl: data.signedUrl,
        token: data.token,
        publicUrl: buildPublicUrl(data.path),
    };
}
const createProductImageUpload = async (userId, contentType) => {
    return createSignedUpload(userId, contentType, getProductsBucketName(), buildProductImagePublicUrl);
};
const createProfileImageUpload = async (userId, contentType) => {
    return createSignedUpload(userId, contentType, getProfilesBucketName(), buildProfileImagePublicUrl);
};
export const uploadsService = {
    createProductImageUpload,
    createProfileImageUpload,
};
