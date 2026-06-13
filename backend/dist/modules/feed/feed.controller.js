import { feedService } from "./feed.service";
import { logger } from "../../utils/logger";
const feedController = {
    list: async (req, res) => {
        const query = req.query;
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
