import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { UnauthorizedError } from "./errors/BaseError";
import { logger } from "../utils/logger";
import type { AuthenticatedUser } from "../types/auth";

const MISSING_TOKEN_MESSAGE = "Token de acesso não informado";
const INVALID_TOKEN_MESSAGE = "Token de acesso inválido ou expirado";
const UNAVAILABLE_ACCOUNT_MESSAGE = "Conta indisponível";

type AccessTokenPayload = {
  sub: string;
};

function getAccessTokenSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  return secret;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, getAccessTokenSecret());
    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string" ||
      payload.sub.length === 0
    ) {
      throw new UnauthorizedError(INVALID_TOKEN_MESSAGE);
    }
    return { sub: payload.sub };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw err;
    }
    throw new UnauthorizedError(INVALID_TOKEN_MESSAGE);
  }
}

export async function loadAuthenticatedUser(
  userId: string
): Promise<AuthenticatedUser> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      is_banned: true,
      is_admin: true,
      deleted_at: true,
    },
  });

  if (!user || user.deleted_at || user.is_banned === true) {
    logger.warn("Autenticação JWT falhou: conta indisponível", { userId });
    throw new UnauthorizedError(UNAVAILABLE_ACCOUNT_MESSAGE);
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    is_admin: user.is_admin,
  };
}

export async function authenticateAccessToken(
  token: string | null | undefined
): Promise<AuthenticatedUser> {
  if (!token || token.length === 0) {
    throw new UnauthorizedError(MISSING_TOKEN_MESSAGE);
  }

  const { sub } = verifyAccessToken(token);
  return loadAuthenticatedUser(sub);
}
