import { Request, Response } from "express";
import { authService } from "./auth.service";
import { logger } from "../../utils/logger";

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
    logger.info("HTTP POST /api/auth/login - Concluído", {
      userId: result.user.id,
    });
    res.status(200).json(result);
  },

  refresh: async (req: Request, res: Response) => {
    logger.info("HTTP POST /api/auth/refresh - Iniciado");
    const result = await authService.refreshAccessToken(req.body);
    logger.info("HTTP POST /api/auth/refresh - Concluído", {
      userId: result.user.id,
    });
    res.status(200).json(result);
  },
};

export { authController };
