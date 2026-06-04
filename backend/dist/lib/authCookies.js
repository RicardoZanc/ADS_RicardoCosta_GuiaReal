const DEFAULT_COOKIE_NAME = "guiareal_refresh";
const AUTH_COOKIE_PATH = "/api/auth";
function getRefreshCookieName() {
    return process.env.REFRESH_COOKIE_NAME?.trim() || DEFAULT_COOKIE_NAME;
}
function getCookieSecure() {
    const raw = process.env.COOKIE_SECURE?.trim().toLowerCase();
    if (raw === "true")
        return true;
    if (raw === "false")
        return false;
    return process.env.NODE_ENV === "production";
}
function getSameSite() {
    const raw = process.env.COOKIE_SAME_SITE?.trim().toLowerCase();
    if (raw === "strict" || raw === "lax" || raw === "none") {
        return raw;
    }
    return "lax";
}
function baseCookieOptions(maxAgeSeconds) {
    return {
        httpOnly: true,
        secure: getCookieSecure(),
        sameSite: getSameSite(),
        path: AUTH_COOKIE_PATH,
        maxAge: maxAgeSeconds * 1000,
    };
}
export function setRefreshTokenCookie(res, token, maxAgeSeconds) {
    res.cookie(getRefreshCookieName(), token, baseCookieOptions(maxAgeSeconds));
}
export function clearRefreshTokenCookie(res) {
    res.clearCookie(getRefreshCookieName(), {
        httpOnly: true,
        secure: getCookieSecure(),
        sameSite: getSameSite(),
        path: AUTH_COOKIE_PATH,
    });
}
export function getRefreshTokenFromRequest(req) {
    const name = getRefreshCookieName();
    const value = req.cookies?.[name];
    if (typeof value !== "string" || value.length === 0) {
        return null;
    }
    return value;
}
