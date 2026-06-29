import { usersService } from "./users.service";
import { logger } from "../../utils/logger";
const usersController = {
    getByUsername: async (req, res) => {
        const username = req.params.username;
        const viewerId = req.user.id;
        logger.info("HTTP GET /api/users/:username - Iniciado", { username });
        const profile = await usersService.getByUsername(username, viewerId);
        logger.info("HTTP GET /api/users/:username - Concluído", {
            username,
            userId: profile.id,
        });
        res.status(200).json(profile);
    },
    listInteractions: async (req, res) => {
        const username = req.params.username;
        const query = req.query;
        logger.info("HTTP GET /api/users/:username/interactions - Iniciado", {
            username,
            page: query.page,
            limit: query.limit,
        });
        const result = await usersService.listInteractions(username, query);
        logger.info("HTTP GET /api/users/:username/interactions - Concluído", {
            username,
            total: result.pagination.total,
        });
        res.status(200).json(result);
    },
    updateMe: async (req, res) => {
        const userId = req.user.id;
        const body = req.body;
        logger.info("HTTP PATCH /api/users/me - Iniciado", { userId });
        const profile = await usersService.updateMe(userId, body);
        logger.info("HTTP PATCH /api/users/me - Concluído", { userId });
        res.status(200).json(profile);
    },
    getMyInterests: async (req, res) => {
        const userId = req.user.id;
        logger.info("HTTP GET /api/users/me/interests - Iniciado", { userId });
        const interests = await usersService.getMyInterests(userId);
        logger.info("HTTP GET /api/users/me/interests - Concluído", {
            userId,
            count: interests.length,
        });
        res.status(200).json({ data: interests });
    },
    replaceMyInterests: async (req, res) => {
        const userId = req.user.id;
        const body = req.body;
        logger.info("HTTP PUT /api/users/me/interests - Iniciado", {
            userId,
            count: body.node_ids.length,
        });
        const interests = await usersService.replaceMyInterests(userId, body);
        logger.info("HTTP PUT /api/users/me/interests - Concluído", {
            userId,
            count: interests.length,
        });
        res.status(200).json({ data: interests });
    },
};
export { usersController };
