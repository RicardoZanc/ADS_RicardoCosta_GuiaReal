import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { UnauthorizedError } from "../lib/errors/BaseError";
import { logger } from "../utils/logger";
import type { AuthenticatedUser } from "../types/auth";

const MISSING_TOKEN_MESSAGE = "Token de acesso não informado";
const INVALID_TOKEN_MESSAGE = "Token de acesso inválido ou expirado";
const UNAVAILABLE_ACCOUNT_MESSAGE = "Conta indisponível";

type AccessTokenPayload = {
  sub: string;
};

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  logger.debug("getBearerToken", { header });
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function getAccessTokenSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  return secret;
}

function verifyAccessToken(token: string): AccessTokenPayload {
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
}

async function loadAuthenticatedUser(
  userId: string
): Promise<AuthenticatedUser> {
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
    logger.warn("Autenticação JWT falhou: conta indisponível", { userId });
    throw new UnauthorizedError(UNAVAILABLE_ACCOUNT_MESSAGE);
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
  };
}

export const authenticateJwt = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      logger.warn("Autenticação JWT falhou: header Authorization ausente ou inválido");
      throw new UnauthorizedError(MISSING_TOKEN_MESSAGE);
    }

    let userId: string;
    try {
      const payload = verifyAccessToken(token);
      userId = payload.sub;
      logger.debug("Autenticação JWT: token decodificado", { userId });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        throw err;
      }
      logger.warn("Autenticação JWT falhou: token inválido ou expirado");
      throw new UnauthorizedError(INVALID_TOKEN_MESSAGE);
    }

    req.user = await loadAuthenticatedUser(userId);
    next();
  } catch (error) {
    next(error);
  }
};
