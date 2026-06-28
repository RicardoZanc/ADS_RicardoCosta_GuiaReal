import { Request, Response } from "express";
import { usersService } from "./users.service";
import type {
  ListUserInteractionsQuery,
  UpdateUserMeInput,
} from "./users.schema";
import { logger } from "../../utils/logger";

const usersController = {
  getByUsername: async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const viewerId = req.user!.id;

    logger.info("HTTP GET /api/users/:username - Iniciado", { username });

    const profile = await usersService.getByUsername(username, viewerId);

    logger.info("HTTP GET /api/users/:username - Concluído", {
      username,
      userId: profile.id,
    });

    res.status(200).json(profile);
  },

  listInteractions: async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const query = req.query as unknown as ListUserInteractionsQuery;

    logger.info("HTTP GET /api/users/:username/interactions - Iniciado", {
      username,
      page: query.page,
      limit: query.limit,
    });

    const result = await usersService.listInteractions(username, query);

    logger.info("HTTP GET /api/users/:username/interactions - Concluído", {
      username,
      total: result.pagination.total,
    });

    res.status(200).json(result);
  },

  updateMe: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const body = req.body as UpdateUserMeInput;

    logger.info("HTTP PATCH /api/users/me - Iniciado", { userId });

    const profile = await usersService.updateMe(userId, body);

    logger.info("HTTP PATCH /api/users/me - Concluído", { userId });

    res.status(200).json(profile);
  },
};

export { usersController };
