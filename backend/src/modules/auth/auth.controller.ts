import { Request, Response } from "express";
import { authService } from "./auth.service";

const authController = {
  signup: async (req: Request, res: Response) => {
    const user = await authService.signup(req.body);
    res.status(201).json(user);
  },

  login: async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  },

  refresh: async (req: Request, res: Response) => {
    const result = await authService.refreshAccessToken(req.body);
    res.status(200).json(result);
  },
};

export { authController };
