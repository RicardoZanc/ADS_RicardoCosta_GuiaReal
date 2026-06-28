import { randomUUID } from "node:crypto";
import { BadRequestError } from "../../lib/errors/BaseError";
import { buildProductImagePublicUrl, getProductsBucketName, getSupabaseAdmin, } from "../../lib/supabase";
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
const createProductImageUpload = async (userId, contentType) => {
    const path = buildObjectPath(userId, contentType);
    const bucket = getProductsBucketName();
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
        publicUrl: buildProductImagePublicUrl(data.path),
    };
};
export const uploadsService = {
    createProductImageUpload,
};
