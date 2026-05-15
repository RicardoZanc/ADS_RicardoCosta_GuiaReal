/**
 * Cliente Redis dedicado ao armazenamento de refresh tokens hashados.
 * Não reutilize este cliente para outros fins de cache ou sessão.
 *
 * Configure `REDIS_URL` (ex.: redis://127.0.0.1:6379 com o container local).
 */
import "dotenv/config";
import { createClient } from "redis";
import { logger } from "../utils/logger";
function requireRedisUrl() {
    const url = process.env.REDIS_URL;
    if (!url?.trim()) {
        throw new Error("REDIS_URL is required for refresh token storage");
    }
    return url;
}
export const refreshTokenRedis = createClient({
    url: requireRedisUrl(),
});
refreshTokenRedis.on("error", (err) => {
    logger.error("Redis (refresh tokens)", err);
});
export async function connectRefreshTokenRedis() {
    await refreshTokenRedis.connect();
}
export async function disconnectRefreshTokenRedis() {
    if (refreshTokenRedis.isOpen) {
        await refreshTokenRedis.quit();
    }
}
export function registerRefreshTokenRedisShutdown() {
    const onShutdown = () => {
        void disconnectRefreshTokenRedis()
            .catch(() => undefined)
            .finally(() => process.exit(0));
    };
    process.once("SIGINT", onShutdown);
    process.once("SIGTERM", onShutdown);
}
