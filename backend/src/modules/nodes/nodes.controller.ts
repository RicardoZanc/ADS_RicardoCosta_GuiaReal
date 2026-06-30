import { Request, Response } from "express";
import { nodesService } from "./nodes.service";
import { changeRequestsService } from "../change-requests/changeRequests.service";
import { resolveNodeSearchQuery } from "./nodes.domainRules";
import type { ListNodeOpinionsQuery, ListNodesQuery } from "./nodes.schema";
import { logger } from "../../utils/logger";

const nodesController = {
  list: async (req: Request, res: Response) => {
    const query = req.query as unknown as ListNodesQuery;
    logger.info("HTTP GET /api/nodes - Iniciado", {
      q: query.q,
      type: query.type,
      tipoId: query.tipo_id,
      page: query.page,
      limit: query.limit,
    });
    const result = await nodesService.search(
      await resolveNodeSearchQuery(query)
    );
    logger.info("HTTP GET /api/nodes - Concluído", {
      total: result.pagination.total,
      page: result.pagination.page,
    });
    res.status(200).json(result);
  },
  getById: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    logger.info("HTTP GET /api/nodes/:id - Iniciado", { nodeId: id });
    const node = await nodesService.getById(id);
    logger.info("HTTP GET /api/nodes/:id - Concluído", {
      nodeId: node.id,
      type: node.type,
    });
    res.status(200).json(node);
  },
  listOpinions: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const query = req.query as unknown as ListNodeOpinionsQuery;
    logger.info("HTTP GET /api/nodes/:id/opinions - Iniciado", {
      nodeId: id,
      page: query.page,
      limit: query.limit,
    });
    const result = await nodesService.listOpinions(id, query, req.user?.id);
    logger.info("HTTP GET /api/nodes/:id/opinions - Concluído", {
      nodeId: id,
      total: result.pagination.total,
      page: result.pagination.page,
    });
    res.status(200).json(result);
  },
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
  update: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user!;

    logger.info("HTTP PATCH /api/nodes/:id - Iniciado", {
      nodeId: id,
      userId: user.id,
      isAdmin: user.is_admin,
    });

    if (user.is_admin) {
      const node = await nodesService.update(id, req.body);
      logger.info("HTTP PATCH /api/nodes/:id - Concluído (admin)", {
        nodeId: node.id,
        type: node.type,
      });
      res.status(200).json(node);
      return;
    }

    const request = await changeRequestsService.createForNode(
      user.id,
      id,
      req.body
    );

    logger.info("HTTP PATCH /api/nodes/:id - Solicitação criada", {
      nodeId: id,
      changeRequestId: request.id,
    });

    res.status(202).json({
      change_request_id: request.id,
      status: "PENDING",
      request,
    });
  },
};

export { nodesController };
