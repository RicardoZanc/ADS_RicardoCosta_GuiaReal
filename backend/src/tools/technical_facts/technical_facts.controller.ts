import { Request, Response } from "express";
import { technicalFactsService } from "./technical_facts.service";
import type {
  CreateTechnicalFactInput,
  ListPendingInteractionsQuery,
} from "./technical_facts.schema";
import { logger } from "../../utils/logger";

const technicalFactsController = {
  listPendingInteractions: async (req: Request, res: Response) => {
    const query = req.query as unknown as ListPendingInteractionsQuery;

    logger.info(
      "HTTP GET /tool/technical-facts/pending-interactions - Iniciado",
      { page: query.page, limit: query.limit }
    );

    const result = await technicalFactsService.listPendingInteractions(query);

    logger.info(
      "HTTP GET /tool/technical-facts/pending-interactions - Concluído",
      { total: result.pagination.total }
    );

    res.status(200).json(result);
  },

  createFact: async (req: Request, res: Response) => {
    const body = req.body as CreateTechnicalFactInput;

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

  markInteractionProcessed: async (req: Request, res: Response) => {
    const threadId = req.params.thread_id as string;

    logger.info(
      "HTTP PATCH /tool/technical-facts/interactions/:thread_id/processed - Iniciado",
      { threadId }
    );

    const result =
      await technicalFactsService.markInteractionProcessed(threadId);

    logger.info(
      "HTTP PATCH /tool/technical-facts/interactions/:thread_id/processed - Concluído",
      { threadId }
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
};

export { technicalFactsController };
