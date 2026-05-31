import { nodesService } from "./nodes.service";
import { resolveNodeSearchQuery } from "./nodes.domainRules";
import { logger } from "../../utils/logger";
const nodesController = {
    list: async (req, res) => {
        const query = req.query;
        logger.info("HTTP GET /api/nodes - Iniciado", {
            q: query.q,
            type: query.type,
            tipoId: query.tipo_id,
            page: query.page,
            limit: query.limit,
        });
        const result = await nodesService.search(await resolveNodeSearchQuery(query));
        logger.info("HTTP GET /api/nodes - Concluído", {
            total: result.pagination.total,
            page: result.pagination.page,
        });
        res.status(200).json(result);
    },
    create: async (req, res) => {
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
