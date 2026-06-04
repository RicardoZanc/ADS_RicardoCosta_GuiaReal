import { randomBytes } from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import {
  SignupInput,
  LoginInput,
  RefreshTokenInput,
} from "./auth.schema";
import { cryptUtils } from "../../lib/crypt";
import {
  userExists,
  usernameAvailable,
  findUserForLoginByEmail,
} from "./auth.domainRules";
import { logger } from "../../utils/logger";
import {
  getRefreshTokenTtlSeconds,
  saveRefreshToken,
  getUserIdByRefreshHash,
  deleteRefreshToken,
} from "../../lib/refreshTokenRedis.store";
import {
  ConflictError,
  UnauthorizedError,
} from "../../lib/errors/BaseError";

const LOGIN_FAIL_MESSAGE = "Credenciais inválidas";
const REFRESH_FAIL_MESSAGE = "Token de atualização inválido";

function signAccessToken(userId: string): string {
  const secret = process.env.JWT_ACCESS_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN?.trim() ||
    "15m") as SignOptions["expiresIn"];
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

const signup = async (SignupInput: SignupInput) => {
  const { email, password, username } = SignupInput;

  logger.debug("Cadastro: payload recebido", { email, username });

  const userExistsResult = await userExists(email);
  if (!userExistsResult) {
    logger.warn("Cadastro rejeitado: e-mail já cadastrado", { email });
    throw new ConflictError("User already exists");
  }

  const usernameAvailableResult = await usernameAvailable(username);
  if (!usernameAvailableResult) {
    logger.warn("Cadastro rejeitado: nome de usuário já cadastrado", {
      username,
    });
    throw new ConflictError("Nome de usuário já cadastrado");
  }

  const hashedPassword = await cryptUtils.hashPassword(password);
  const user = await prisma.users.create({
    data: {
      email,
      username,
      hashpassword: hashedPassword,
    },
  });

  logger.debug("Cadastro: usuário persistido", { userId: user.id });

  return user;
};

const login = async (input: LoginInput) => {
  logger.debug("Login: início da autenticação", { email: input.email });

  const user = await findUserForLoginByEmail(input.email);
  if (!user) {
    logger.warn("Login falhou: conta indisponível ou inexistente", {
      email: input.email,
      reason: "not_found",
    });
    throw new UnauthorizedError(LOGIN_FAIL_MESSAGE);
  }
  if (user.deleted_at) {
    logger.warn("Login falhou: conta indisponível ou inexistente", {
      email: input.email,
      reason: "deleted",
    });
    throw new UnauthorizedError(LOGIN_FAIL_MESSAGE);
  }
  if (user.is_banned === true) {
    logger.warn("Login falhou: conta indisponível ou inexistente", {
      email: input.email,
      reason: "banned",
    });
    throw new UnauthorizedError(LOGIN_FAIL_MESSAGE);
  }

  const ok = await cryptUtils.comparePassword(
    input.password,
    user.hashpassword
  );
  if (!ok) {
    logger.warn("Login falhou: senha incorreta", { email: input.email });
    throw new UnauthorizedError(LOGIN_FAIL_MESSAGE);
  }

  const refreshToken = randomBytes(32).toString("base64url");
  const hash = cryptUtils.hashRefreshTokenFingerprint(refreshToken);
  const ttl = getRefreshTokenTtlSeconds();
  await saveRefreshToken(hash, user.id, ttl);

  const accessToken = signAccessToken(user.id);

  logger.debug("Login: autenticação concluída", {
    userId: user.id,
    refreshTtlSeconds: ttl,
  });

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

const refreshAccessToken = async (input: RefreshTokenInput) => {
  logger.debug("Refresh: validação do token iniciada");

  const hash = cryptUtils.hashRefreshTokenFingerprint(input.refreshToken);
  const userId = await getUserIdByRefreshHash(hash);
  if (!userId) {
    logger.warn(
      "Refresh falhou: token não encontrado ou expirado no Redis"
    );
    throw new UnauthorizedError(REFRESH_FAIL_MESSAGE);
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
    logger.warn("Refresh falhou: usuário indisponível", { userId });
    throw new UnauthorizedError(REFRESH_FAIL_MESSAGE);
  }

  const accessToken = signAccessToken(user.id);

  logger.debug("Refresh: access token reemitido", { userId: user.id });

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  };
};

const logout = async (refreshToken: string) => {
  const hash = cryptUtils.hashRefreshTokenFingerprint(refreshToken);
  await deleteRefreshToken(hash);
  logger.debug("Logout: refresh token revogado no Redis");
};

export const authService = {
  signup,
  login,
  refreshAccessToken,
  logout,
};
