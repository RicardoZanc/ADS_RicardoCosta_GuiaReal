import { searchService } from "./search.service";
import { logger } from "../../utils/logger";
const searchController = {
    globalSearch: async (req, res) => {
        const query = req.query;
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
