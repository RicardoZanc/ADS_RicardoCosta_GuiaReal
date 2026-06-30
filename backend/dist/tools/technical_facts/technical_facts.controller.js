import { technicalFactsService } from "./technical_facts.service";
import { logger } from "../../utils/logger";
const technicalFactsController = {
    listPendingQueue: async (req, res) => {
        const query = req.query;
        logger.info("HTTP GET /tool/technical-facts/pending-queue - Iniciado", {
            page: query.page,
            limit: query.limit,
        });
        const result = await technicalFactsService.listPendingQueue(query);
        logger.info("HTTP GET /tool/technical-facts/pending-queue - Concluído", {
            total: result.pagination.total,
        });
        res.status(200).json(result);
    },
    createFact: async (req, res) => {
        const body = req.body;
        logger.info("HTTP POST /tool/technical-facts - Iniciado", {
            nodeId: body.node_id,
            evidenceCount: body.evidence.length,
        });
        const fact = await technicalFactsService.createFact(body);
        logger.info("HTTP POST /tool/technical-facts - Concluído", {
            factId: fact.id,
        });
        res.status(201).json(fact);
    },
    markQueueItemProcessed: async (req, res) => {
        const { source_type: sourceType, source_id: sourceId } = req.params;
        logger.info("HTTP PATCH /tool/technical-facts/queue/:source_type/:source_id/processed - Iniciado", { sourceType, sourceId });
        const result = await technicalFactsService.markQueueItemProcessed(sourceType, sourceId);
        logger.info("HTTP PATCH /tool/technical-facts/queue/:source_type/:source_id/processed - Concluído", { sourceType, sourceId });
        res.status(200).json(result);
    },
    listByNode: async (req, res) => {
        const query = req.query;
        logger.info("HTTP GET /tool/technical-facts - Iniciado", {
            nodeId: query.node_id,
            status: query.status,
            limit: query.limit,
        });
        const result = await technicalFactsService.listFacts(query);
        logger.info("HTTP GET /tool/technical-facts - Concluído", {
            count: result.data.length,
        });
        res.status(200).json(result);
    },
    listByEvidence: async (req, res) => {
        const { source_type: sourceType, source_id: sourceId } = req.params;
        logger.info("HTTP GET /tool/technical-facts/by-evidence/:source_type/:source_id - Iniciado", { sourceType, sourceId });
        const result = await technicalFactsService.listByEvidence(sourceType, sourceId);
        logger.info("HTTP GET /tool/technical-facts/by-evidence/:source_type/:source_id - Concluído", { sourceType, sourceId, count: result.data.length });
        res.status(200).json(result);
    },
    updateFact: async (req, res) => {
        const factId = req.params.id;
        const body = req.body;
        logger.info("HTTP PATCH /tool/technical-facts/:id - Iniciado", {
            factId,
        });
        const fact = await technicalFactsService.updateFact(factId, body);
        logger.info("HTTP PATCH /tool/technical-facts/:id - Concluído", {
            factId: fact.id,
        });
        res.status(200).json(fact);
    },
    addEvidence: async (req, res) => {
        const factId = req.params.id;
        const body = req.body;
        logger.info("HTTP POST /tool/technical-facts/:id/evidence - Iniciado", {
            factId,
            evidenceCount: body.evidence.length,
        });
        const fact = await technicalFactsService.addEvidence(factId, body);
        logger.info("HTTP POST /tool/technical-facts/:id/evidence - Concluído", {
            factId: fact.id,
        });
        res.status(200).json(fact);
    },
    removeEvidence: async (req, res) => {
        const factId = req.params.fact_id;
        const sourceType = req.params.source_type;
        const sourceId = req.params.source_id;
        logger.info("HTTP DELETE /tool/technical-facts/:fact_id/evidence/:source_type/:source_id - Iniciado", { factId, sourceType, sourceId });
        const result = await technicalFactsService.removeEvidence(factId, sourceType, sourceId);
        logger.info("HTTP DELETE /tool/technical-facts/:fact_id/evidence/:source_type/:source_id - Concluído", { factId, sourceType, sourceId });
        res.status(200).json(result);
    },
};
export { technicalFactsController };
