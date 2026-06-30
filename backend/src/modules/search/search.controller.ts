import { Request, Response } from "express";
import { searchService } from "./search.service";
import type { GlobalSearchQuery } from "./search.schema";
import { logger } from "../../utils/logger";

const searchController = {
  globalSearch: async (req: Request, res: Response) => {
    const query = req.query as unknown as GlobalSearchQuery;
    logger.info("HTTP GET /api/search - Iniciado", {
      q: query.q,
      limitNodes: query.limit_nodes,
      limitProducts: query.limit_products,
    });

    const result = await searchService.globalSearch(query);

    logger.info("HTTP GET /api/search - Concluído", {
      nodeCount: result.nodes.data.length,
      productCount: result.products.data.length,
    });

    res.status(200).json(result);
  },
};

export { searchController };
