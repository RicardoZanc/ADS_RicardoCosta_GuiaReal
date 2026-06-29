import { Request, Response } from "express";
import { feedService } from "./feed.service";
import type { ListFeedQuery } from "./feed.schema";
import { logger } from "../../utils/logger";

const feedController = {
  list: async (req: Request, res: Response) => {
    const query = req.query as unknown as ListFeedQuery & {
      simplified?: boolean;
    };

    if (query.simplified) {
      const limit = Math.min(Math.max(query.limit ?? 8, 1), 20);
      const userId = req.user?.id;

      logger.info("HTTP GET /api/feed?simplified=true - Iniciado", {
        limit,
        userId: userId ?? null,
      });

      const result = await feedService.listSimplified(userId, limit);

      logger.info("HTTP GET /api/feed?simplified=true - Concluído", {
        community: result.community.length,
        interests: result.interests.length,
        new: result.new.length,
      });

      res.status(200).json(result);
      return;
    }

    logger.info("HTTP GET /api/feed - Iniciado", {
      page: query.page,
      limit: query.limit,
    });

    const result = await feedService.list(query);

    logger.info("HTTP GET /api/feed - Concluído", {
      total: result.pagination.total,
      page: result.pagination.page,
    });

    res.status(200).json(result);
  },
};

export { feedController };
