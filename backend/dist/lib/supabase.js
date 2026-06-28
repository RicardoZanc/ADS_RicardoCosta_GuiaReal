import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
const PRODUCTS_BUCKET = "products";
const PROFILES_BUCKET = "profiles";
function requireSupabaseUrl() {
    const url = process.env.SUPABASE_URL?.trim();
    if (!url) {
        throw new Error("SUPABASE_URL is required for Supabase Storage");
    }
    return url.replace(/\/$/, "");
}
function requireSupabaseServiceRoleKey() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!key) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for Supabase Storage");
    }
    return key;
}
let supabaseAdminClient = null;
export function getSupabaseAdmin() {
    if (!supabaseAdminClient) {
        supabaseAdminClient = createClient(requireSupabaseUrl(), requireSupabaseServiceRoleKey(), {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return supabaseAdminClient;
}
export function getProductsBucketName() {
    return PRODUCTS_BUCKET;
}
export function getProfilesBucketName() {
    return PROFILES_BUCKET;
}
export function buildProductImagePublicUrl(path) {
    const baseUrl = requireSupabaseUrl();
    return `${baseUrl}/storage/v1/object/public/${PRODUCTS_BUCKET}/${path}`;
}
export function buildProfileImagePublicUrl(path) {
    const baseUrl = requireSupabaseUrl();
    return `${baseUrl}/storage/v1/object/public/${PROFILES_BUCKET}/${path}`;
}
export function getProductImagePublicUrlPrefix() {
    const url = process.env.SUPABASE_URL?.trim();
    if (!url) {
        return null;
    }
    const baseUrl = url.replace(/\/$/, "");
    return `${baseUrl}/storage/v1/object/public/${PRODUCTS_BUCKET}/`;
}
export function getProfileImagePublicUrlPrefix() {
    const url = process.env.SUPABASE_URL?.trim();
    if (!url) {
        return null;
    }
    const baseUrl = url.replace(/\/$/, "");
    return `${baseUrl}/storage/v1/object/public/${PROFILES_BUCKET}/`;
}
export function isAllowedProductImageUrl(imageUrl) {
    const prefix = getProductImagePublicUrlPrefix();
    if (!prefix) {
        return false;
    }
    return imageUrl.startsWith(prefix);
}
export function isAllowedProfileImageUrl(imageUrl) {
    const prefix = getProfileImagePublicUrlPrefix();
    if (!prefix) {
        return false;
    }
    return imageUrl.startsWith(prefix);
}
