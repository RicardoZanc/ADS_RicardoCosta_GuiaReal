import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { cryptUtils } from "../../lib/crypt";
import { userExists, findUserForLoginByEmail } from "./auth.domainRules";
import { logger } from "../../utils/logger";
import { getRefreshTokenTtlSeconds, saveRefreshToken, getUserIdByRefreshHash, } from "../../lib/refreshTokenRedis.store";
import { AuthUnauthorizedError } from "./auth.errors";
const LOGIN_FAIL_MESSAGE = "Credenciais inválidas";
const REFRESH_FAIL_MESSAGE = "Token de atualização inválido";
function signAccessToken(userId) {
    const secret = process.env.JWT_ACCESS_SECRET?.trim();
    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not configured");
    }
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN?.trim() ||
        "15m");
    return jwt.sign({ sub: userId }, secret, { expiresIn });
}
const signup = async (SignupInput) => {
    const { email, password, username } = SignupInput;
    const userExistsResult = await userExists(email);
    if (!userExistsResult) {
        logger.warn("User already exists");
        throw new Error("User already exists");
    }
    const hashedPassword = await cryptUtils.hashPassword(password);
    const user = await prisma.users.create({
        data: {
            email,
            username,
            hashpassword: hashedPassword,
        },
    });
    return user;
};
const login = async (input) => {
    const user = await findUserForLoginByEmail(input.email);
    if (!user || user.deleted_at || user.is_banned === true) {
        throw new AuthUnauthorizedError(LOGIN_FAIL_MESSAGE);
    }
    const ok = await cryptUtils.comparePassword(input.password, user.hashpassword);
    if (!ok) {
        throw new AuthUnauthorizedError(LOGIN_FAIL_MESSAGE);
    }
    const refreshToken = randomBytes(32).toString("base64url");
    const hash = cryptUtils.hashRefreshTokenFingerprint(refreshToken);
    const ttl = getRefreshTokenTtlSeconds();
    await saveRefreshToken(hash, user.id, ttl);
    const accessToken = signAccessToken(user.id);
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
        },
    };
};
const refreshAccessToken = async (input) => {
    const hash = cryptUtils.hashRefreshTokenFingerprint(input.refreshToken);
    const userId = await getUserIdByRefreshHash(hash);
    if (!userId) {
        throw new AuthUnauthorizedError(REFRESH_FAIL_MESSAGE);
    }
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            username: true,
            is_banned: true,
            deleted_at: true,
        },
    });
    if (!user || user.deleted_at || user.is_banned === true) {
        throw new AuthUnauthorizedError(REFRESH_FAIL_MESSAGE);
    }
    const accessToken = signAccessToken(user.id);
    return {
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
        },
    };
};
export const authService = {
    signup,
    login,
    refreshAccessToken,
};
