import { Request, Response } from "express";
import { technicalFactsService } from "./technical_facts.service";
import type {
  CreateTechnicalFactInput,
  ListByEvidenceParams,
  ListPendingQueueQuery,
  MarkQueueItemProcessedParams,
  UpdateTechnicalFactInput,
} from "./technical_facts.schema";
import { logger } from "../../utils/logger";

const technicalFactsController = {
  listPendingQueue: async (req: Request, res: Response) => {
    const query = req.query as unknown as ListPendingQueueQuery;

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

  createFact: async (req: Request, res: Response) => {
    const body = req.body as CreateTechnicalFactInput;

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

  markQueueItemProcessed: async (req: Request, res: Response) => {
    const { source_type: sourceType, source_id: sourceId } =
      req.params as unknown as MarkQueueItemProcessedParams;

    logger.info(
      "HTTP PATCH /tool/technical-facts/queue/:source_type/:source_id/processed - Iniciado",
      { sourceType, sourceId }
    );

    const result = await technicalFactsService.markQueueItemProcessed(
      sourceType,
      sourceId
    );

    logger.info(
      "HTTP PATCH /tool/technical-facts/queue/:source_type/:source_id/processed - Concluído",
      { sourceType, sourceId }
    );

    res.status(200).json(result);
  },

  listByNode: async (req: Request, res: Response) => {
    const nodeId = req.query.node_id as string;

    logger.info("HTTP GET /tool/technical-facts - Iniciado", { nodeId });

    const result = await technicalFactsService.listByNode(nodeId);

    logger.info("HTTP GET /tool/technical-facts - Concluído", {
      nodeId,
      count: result.data.length,
    });

    res.status(200).json(result);
  },

  listByEvidence: async (req: Request, res: Response) => {
    const { source_type: sourceType, source_id: sourceId } =
      req.params as unknown as ListByEvidenceParams;

    logger.info(
      "HTTP GET /tool/technical-facts/by-evidence/:source_type/:source_id - Iniciado",
      { sourceType, sourceId }
    );

    const result = await technicalFactsService.listByEvidence(
      sourceType,
      sourceId
    );

    logger.info(
      "HTTP GET /tool/technical-facts/by-evidence/:source_type/:source_id - Concluído",
      { sourceType, sourceId, count: result.data.length }
    );

    res.status(200).json(result);
  },

  updateFact: async (req: Request, res: Response) => {
    const factId = req.params.id as string;
    const body = req.body as UpdateTechnicalFactInput;

    logger.info("HTTP PATCH /tool/technical-facts/:id - Iniciado", {
      factId,
    });

    const fact = await technicalFactsService.updateFact(factId, body);

    logger.info("HTTP PATCH /tool/technical-facts/:id - Concluído", {
      factId: fact.id,
    });

    res.status(200).json(fact);
  },

  removeEvidence: async (req: Request, res: Response) => {
    const factId = req.params.fact_id as string;
    const sourceType = req.params.source_type as ListByEvidenceParams["source_type"];
    const sourceId = req.params.source_id as string;

    logger.info(
      "HTTP DELETE /tool/technical-facts/:fact_id/evidence/:source_type/:source_id - Iniciado",
      { factId, sourceType, sourceId }
    );

    const result = await technicalFactsService.removeEvidence(
      factId,
      sourceType,
      sourceId
    );

    logger.info(
      "HTTP DELETE /tool/technical-facts/:fact_id/evidence/:source_type/:source_id - Concluído",
      { factId, sourceType, sourceId }
    );

    res.status(200).json(result);
  },
};

export { technicalFactsController };
