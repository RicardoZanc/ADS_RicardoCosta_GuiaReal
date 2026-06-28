import { technicalFactsService } from "./technical_facts.service";
import { logger } from "../../utils/logger";
const technicalFactsController = {
    listPendingInteractions: async (req, res) => {
        const query = req.query;
        logger.info("HTTP GET /tool/technical-facts/pending-interactions - Iniciado", { page: query.page, limit: query.limit });
        const result = await technicalFactsService.listPendingInteractions(query);
        logger.info("HTTP GET /tool/technical-facts/pending-interactions - Concluído", { total: result.pagination.total });
        res.status(200).json(result);
    },
    createFact: async (req, res) => {
        const body = req.body;
        logger.info("HTTP POST /tool/technical-facts - Iniciado", {
            nodeId: body.node_id,
            evidenceCount: body.evidence_thread_ids.length,
        });
        const fact = await technicalFactsService.createFact(body);
        logger.info("HTTP POST /tool/technical-facts - Concluído", {
            factId: fact.id,
        });
        res.status(201).json(fact);
    },
    markInteractionProcessed: async (req, res) => {
        const threadId = req.params.thread_id;
        logger.info("HTTP PATCH /tool/technical-facts/interactions/:thread_id/processed - Iniciado", { threadId });
        const result = await technicalFactsService.markInteractionProcessed(threadId);
        logger.info("HTTP PATCH /tool/technical-facts/interactions/:thread_id/processed - Concluído", { threadId });
        res.status(200).json(result);
    },
    listByNode: async (req, res) => {
        const nodeId = req.query.node_id;
        logger.info("HTTP GET /tool/technical-facts - Iniciado", { nodeId });
        const result = await technicalFactsService.listByNode(nodeId);
        logger.info("HTTP GET /tool/technical-facts - Concluído", {
            nodeId,
            count: result.data.length,
        });
        res.status(200).json(result);
    },
};
export { technicalFactsController };
