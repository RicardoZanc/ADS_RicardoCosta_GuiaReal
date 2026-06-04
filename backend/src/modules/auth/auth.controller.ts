import { Request, Response } from "express";
import { authService } from "./auth.service";
import { logger } from "../../utils/logger";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
} from "../../lib/authCookies";
import { getRefreshTokenTtlSeconds } from "../../lib/refreshTokenRedis.store";
import { UnauthorizedError } from "../../lib/errors/BaseError";

const REFRESH_FAIL_MESSAGE = "Token de atualização inválido";

const authController = {
  signup: async (req: Request, res: Response) => {
    logger.info("HTTP POST /api/auth/signup - Iniciado", {
      email: req.body.email,
    });
    const user = await authService.signup(req.body);
    logger.info("HTTP POST /api/auth/signup - Concluído", { userId: user.id });
    res.status(201).json(user);
  },

  login: async (req: Request, res: Response) => {
    logger.info("HTTP POST /api/auth/login - Iniciado", {
      email: req.body.email,
    });
    const result = await authService.login(req.body);
    setRefreshTokenCookie(
      res,
      result.refreshToken,
      getRefreshTokenTtlSeconds()
    );
    logger.info("HTTP POST /api/auth/login - Concluído", {
      userId: result.user.id,
    });
    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  },

  refresh: async (req: Request, res: Response) => {
    logger.info("HTTP POST /api/auth/refresh - Iniciado");
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      throw new UnauthorizedError(REFRESH_FAIL_MESSAGE);
    }
    const result = await authService.refreshAccessToken({ refreshToken });
    logger.info("HTTP POST /api/auth/refresh - Concluído", {
      userId: result.user.id,
    });
    res.status(200).json(result);
  },

  logout: async (req: Request, res: Response) => {
    logger.info("HTTP POST /api/auth/logout - Iniciado");
    const refreshToken = getRefreshTokenFromRequest(req);
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshTokenCookie(res);
    logger.info("HTTP POST /api/auth/logout - Concluído");
    res.status(204).send();
  },
};

export { authController };
