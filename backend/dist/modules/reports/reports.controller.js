import { reportsService } from "./reports.service";
import { logger } from "../../utils/logger";
const reportsController = {
    create: async (req, res) => {
        const userId = req.user.id;
        logger.info("HTTP POST /api/reports - Iniciado", { userId });
        const report = await reportsService.create(userId, req.body);
        logger.info("HTTP POST /api/reports - Concluído", {
            reportId: report.id,
            linkedFactCount: report.linked_fact_count,
        });
        res.status(201).json(report);
    },
    list: async (req, res) => {
        logger.info("HTTP GET /api/reports - Iniciado");
        const result = await reportsService.list(req.query);
        logger.info("HTTP GET /api/reports - Concluído", {
            count: result.data.length,
            total: result.pagination.total,
        });
        res.status(200).json(result);
    },
    update: async (req, res) => {
        const reportId = req.params.id;
        const reviewerId = req.user.id;
        logger.info("HTTP PATCH /api/reports/:id - Iniciado", {
            reportId,
            reviewerId,
            status: req.body.status,
        });
        const report = await reportsService.update(reportId, reviewerId, req.body);
        logger.info("HTTP PATCH /api/reports/:id - Concluído", {
            reportId: report.id,
            status: report.status,
        });
        res.status(200).json(report);
    },
};
export { reportsController };
