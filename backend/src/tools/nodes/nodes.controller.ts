import { Request, Response } from "express";
import { nodesService } from "../../modules/nodes/nodes.service";
import { resolveNodeSearchQuery } from "../../modules/nodes/nodes.domainRules";
import type { SearchNodesQuery } from "./nodes.schema";
import { logger } from "../../utils/logger";

const nodesToolController = {
  search: async (req: Request, res: Response) => {
    const query = req.query as unknown as SearchNodesQuery;

    logger.info("HTTP GET /tool/nodes/search - Iniciado", {
      q: query.q,
      type: query.type,
      page: query.page,
      limit: query.limit,
    });

    const result = await nodesService.search(
      await resolveNodeSearchQuery(query)
    );

    logger.info("HTTP GET /tool/nodes/search - Concluído", {
      q: query.q,
      total: result.pagination.total,
    });

    res.status(200).json(result);
  },
};

export { nodesToolController };
