import { Request, Response } from "express";
import { changeRequestsService } from "./changeRequests.service";
import { logger } from "../../utils/logger";

const changeRequestsController = {
  listMine: async (req: Request, res: Response) => {
    const userId = req.user!.id;

    logger.info("HTTP GET /api/change-requests/me - Iniciado", { userId });

    const result = await changeRequestsService.listMine(
      userId,
      req.query as never
    );

    logger.info("HTTP GET /api/change-requests/me - Concluído", {
      count: result.requests.length,
    });

    res.status(200).json(result);
  },

  list: async (req: Request, res: Response) => {
    logger.info("HTTP GET /api/change-requests - Iniciado");

    const result = await changeRequestsService.list(req.query as never);

    logger.info("HTTP GET /api/change-requests - Concluído", {
      count: result.data.length,
      total: result.pagination.total,
    });

    res.status(200).json(result);
  },

  review: async (req: Request, res: Response) => {
    const requestId = req.params.id as string;
    const reviewerId = req.user!.id;

    logger.info("HTTP PATCH /api/change-requests/:id - Iniciado", {
      requestId,
      reviewerId,
      status: req.body.status,
    });

    const request = await changeRequestsService.review(
      requestId,
      reviewerId,
      req.body
    );

    logger.info("HTTP PATCH /api/change-requests/:id - Concluído", {
      requestId: request.id,
      status: request.status,
    });

    res.status(200).json(request);
  },
};

export { changeRequestsController };
