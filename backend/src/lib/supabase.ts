import "dotenv/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PRODUCTS_BUCKET = "products";
const PROFILES_BUCKET = "profiles";

function requireSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("SUPABASE_URL is required for Supabase Storage");
  }
  return url.replace(/\/$/, "");
}

function requireSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for Supabase Storage");
  }
  return key;
}

let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      requireSupabaseUrl(),
      requireSupabaseServiceRoleKey(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return supabaseAdminClient;
}

export function getProductsBucketName(): string {
  return PRODUCTS_BUCKET;
}

export function getProfilesBucketName(): string {
  return PROFILES_BUCKET;
}

export function buildProductImagePublicUrl(path: string): string {
  const baseUrl = requireSupabaseUrl();
  return `${baseUrl}/storage/v1/object/public/${PRODUCTS_BUCKET}/${path}`;
}

export function buildProfileImagePublicUrl(path: string): string {
  const baseUrl = requireSupabaseUrl();
  return `${baseUrl}/storage/v1/object/public/${PROFILES_BUCKET}/${path}`;
}

export function getProductImagePublicUrlPrefix(): string | null {
  const url = process.env.SUPABASE_URL?.trim();
  if (!url) {
    return null;
  }

  const baseUrl = url.replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/${PRODUCTS_BUCKET}/`;
}

export function getProfileImagePublicUrlPrefix(): string | null {
  const url = process.env.SUPABASE_URL?.trim();
  if (!url) {
    return null;
  }

  const baseUrl = url.replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/${PROFILES_BUCKET}/`;
}

export function isAllowedProductImageUrl(imageUrl: string): boolean {
  const prefix = getProductImagePublicUrlPrefix();
  if (!prefix) {
    return false;
  }

  return imageUrl.startsWith(prefix);
}

export function isAllowedProfileImageUrl(imageUrl: string): boolean {
  const prefix = getProfileImagePublicUrlPrefix();
  if (!prefix) {
    return false;
  }

  return imageUrl.startsWith(prefix);
}
