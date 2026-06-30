import { Request, Response } from "express";
import { evidenceService } from "./evidence.service";
import { logger } from "../../utils/logger";

const evidenceController = {
  preview: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const evidenceCount = req.body.evidence?.length ?? 0;

    logger.info("HTTP POST /api/evidence/preview - Iniciado", {
      userId,
      evidenceCount,
    });

    const result = await evidenceService.preview(req.body);

    logger.info("HTTP POST /api/evidence/preview - Concluído", {
      userId,
      resolvedCount: result.data.length,
    });

    res.status(200).json(result);
  },
};

export { evidenceController };
