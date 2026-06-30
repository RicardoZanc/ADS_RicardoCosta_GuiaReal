import { adminRequestsService } from "./adminRequests.service";
import { logger } from "../../utils/logger";
const adminRequestsController = {
    create: async (req, res) => {
        const userId = req.user.id;
        logger.info("HTTP POST /api/admin-requests - Iniciado", { userId });
        const request = await adminRequestsService.create(userId, req.body);
        logger.info("HTTP POST /api/admin-requests - Concluído", {
            requestId: request.id,
        });
        res.status(201).json(request);
    },
    listMine: async (req, res) => {
        const userId = req.user.id;
        logger.info("HTTP GET /api/admin-requests/me - Iniciado", { userId });
        const result = await adminRequestsService.listMine(userId);
        logger.info("HTTP GET /api/admin-requests/me - Concluído", {
            count: result.requests.length,
        });
        res.status(200).json(result);
    },
    list: async (req, res) => {
        logger.info("HTTP GET /api/admin-requests - Iniciado");
        const result = await adminRequestsService.list(req.query);
        logger.info("HTTP GET /api/admin-requests - Concluído", {
            count: result.data.length,
            total: result.pagination.total,
        });
        res.status(200).json(result);
    },
    update: async (req, res) => {
        const requestId = req.params.id;
        const reviewerId = req.user.id;
        logger.info("HTTP PATCH /api/admin-requests/:id - Iniciado", {
            requestId,
            reviewerId,
            status: req.body.status,
        });
        const request = await adminRequestsService.update(requestId, reviewerId, req.body);
        logger.info("HTTP PATCH /api/admin-requests/:id - Concluído", {
            requestId: request.id,
            status: request.status,
        });
        res.status(200).json(request);
    },
};
export { adminRequestsController };
