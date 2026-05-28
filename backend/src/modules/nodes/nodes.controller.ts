import { Request, Response } from "express";
import { nodesService } from "./nodes.service";
import { logger } from "../../utils/logger";

const nodesController = {
  create: async (req: Request, res: Response) => {
    logger.info("HTTP POST /api/nodes - Iniciado", {
      type: req.body.type,
      name: req.body.name,
    });
    const node = await nodesService.create(req.body);
    logger.info("HTTP POST /api/nodes - Concluído", {
      nodeId: node.id,
      type: node.type,
    });
    res.status(201).json(node);
  },
};

export { nodesController };
