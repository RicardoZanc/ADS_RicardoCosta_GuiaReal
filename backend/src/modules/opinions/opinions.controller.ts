import { Request, Response } from "express";
import { opinionsService } from "./opinions.service";
import { logger } from "../../utils/logger";

const opinionsController = {
  createOnProduct: async (req: Request, res: Response) => {
    const productId = req.params.product_id as string;
    const userId = req.user!.id;

    logger.info("HTTP POST /api/opinions/products/:product_id - Iniciado", {
      productId,
      userId,
    });

    const opinion = await opinionsService.createOnProduct(
      productId,
      userId,
      req.body
    );

    logger.info("HTTP POST /api/opinions/products/:product_id - Concluído", {
      opinionId: opinion.id,
      productId,
    });

    res.status(201).json(opinion);
  },

  createOnNode: async (req: Request, res: Response) => {
    const nodeId = req.params.node_id as string;
    const userId = req.user!.id;

    logger.info("HTTP POST /api/opinions/nodes/:node_id - Iniciado", {
      nodeId,
      userId,
    });

    const opinion = await opinionsService.createOnNode(nodeId, userId, req.body);

    logger.info("HTTP POST /api/opinions/nodes/:node_id - Concluído", {
      opinionId: opinion.id,
      nodeId,
    });

    res.status(201).json(opinion);
  },

  createThread: async (req: Request, res: Response) => {
    const opinionId = req.params.opinion_id as string;
    const userId = req.user!.id;

    logger.info("HTTP POST /api/opinions/:opinion_id/threads - Iniciado", {
      opinionId,
      userId,
    });

    const thread = await opinionsService.createThread(
      opinionId,
      userId,
      req.body
    );

    logger.info("HTTP POST /api/opinions/:opinion_id/threads - Concluído", {
      threadId: thread.id,
      opinionId,
    });

    res.status(201).json(thread);
  },
};

export { opinionsController };
