import { Request, Response } from "express";
import { reportsService } from "./reports.service";
import { logger } from "../../utils/logger";

const reportsController = {
  create: async (req: Request, res: Response) => {
    const userId = req.user!.id;

    logger.info("HTTP POST /api/reports - Iniciado", { userId });

    const report = await reportsService.create(userId, req.body);

    logger.info("HTTP POST /api/reports - Concluído", {
      reportId: report.id,
      linkedFactCount: report.linked_fact_count,
    });

    res.status(201).json(report);
  },

  list: async (req: Request, res: Response) => {
    logger.info("HTTP GET /api/reports - Iniciado");

    const result = await reportsService.list(req.query as never);

    logger.info("HTTP GET /api/reports - Concluído", {
      count: result.data.length,
      total: result.pagination.total,
    });

    res.status(200).json(result);
  },

  update: async (req: Request, res: Response) => {
    const reportId = req.params.id as string;
    const reviewerId = req.user!.id;

    logger.info("HTTP PATCH /api/reports/:id - Iniciado", {
      reportId,
      reviewerId,
      status: req.body.status,
    });

    const report = await reportsService.update(
      reportId,
      reviewerId,
      req.body
    );

    logger.info("HTTP PATCH /api/reports/:id - Concluído", {
      reportId: report.id,
      status: report.status,
    });

    res.status(200).json(report);
  },
};

export { reportsController };
