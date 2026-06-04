import { refreshTokenRedis } from "./redis";

const KEY_PREFIX = "guiareal:rt:";

function keyForHash(hash: string): string {
  return `${KEY_PREFIX}${hash}`;
}

const DEFAULT_TTL_SECONDS = 604800;

export function getRefreshTokenTtlSeconds(): number {
  const raw = process.env.REFRESH_TOKEN_TTL_SECONDS;
  if (raw === undefined || raw.trim() === "") {
    return DEFAULT_TTL_SECONDS;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TTL_SECONDS;
}

export async function saveRefreshToken(
  hash: string,
  userId: string,
  ttlSeconds: number
): Promise<void> {
  await refreshTokenRedis.set(keyForHash(hash), userId, { EX: ttlSeconds });
}

export async function getUserIdByRefreshHash(
  hash: string
): Promise<string | null> {
  const value = await refreshTokenRedis.get(keyForHash(hash));
  return value;
}

export async function deleteRefreshToken(hash: string): Promise<void> {
  await refreshTokenRedis.del(keyForHash(hash));
}
