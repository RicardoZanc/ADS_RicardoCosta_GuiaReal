import { changeRequestsService } from "./changeRequests.service";
import { logger } from "../../utils/logger";
const changeRequestsController = {
    listMine: async (req, res) => {
        const userId = req.user.id;
        logger.info("HTTP GET /api/change-requests/me - Iniciado", { userId });
        const result = await changeRequestsService.listMine(userId, req.query);
        logger.info("HTTP GET /api/change-requests/me - Concluído", {
            count: result.requests.length,
        });
        res.status(200).json(result);
    },
    list: async (req, res) => {
        logger.info("HTTP GET /api/change-requests - Iniciado");
        const result = await changeRequestsService.list(req.query);
        logger.info("HTTP GET /api/change-requests - Concluído", {
            count: result.data.length,
            total: result.pagination.total,
        });
        res.status(200).json(result);
    },
    review: async (req, res) => {
        const requestId = req.params.id;
        const reviewerId = req.user.id;
        logger.info("HTTP PATCH /api/change-requests/:id - Iniciado", {
            requestId,
            reviewerId,
            status: req.body.status,
        });
        const request = await changeRequestsService.review(requestId, reviewerId, req.body);
        logger.info("HTTP PATCH /api/change-requests/:id - Concluído", {
            requestId: request.id,
            status: request.status,
        });
        res.status(200).json(request);
    },
};
export { changeRequestsController };
