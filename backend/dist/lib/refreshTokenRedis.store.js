import { refreshTokenRedis } from "./redis";
const KEY_PREFIX = "guiareal:rt:";
function keyForHash(hash) {
    return `${KEY_PREFIX}${hash}`;
}
const DEFAULT_TTL_SECONDS = 604800;
export function getRefreshTokenTtlSeconds() {
    const raw = process.env.REFRESH_TOKEN_TTL_SECONDS;
    if (raw === undefined || raw.trim() === "") {
        return DEFAULT_TTL_SECONDS;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_TTL_SECONDS;
}
export async function saveRefreshToken(hash, userId, ttlSeconds) {
    await refreshTokenRedis.set(keyForHash(hash), userId, { EX: ttlSeconds });
}
export async function getUserIdByRefreshHash(hash) {
    const value = await refreshTokenRedis.get(keyForHash(hash));
    return value;
}
export async function deleteRefreshToken(hash) {
    await refreshTokenRedis.del(keyForHash(hash));
}
