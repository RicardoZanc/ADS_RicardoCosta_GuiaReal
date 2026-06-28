import { Request, Response } from "express";
import { uploadsService } from "./uploads.service";
import { logger } from "../../utils/logger";

const uploadsController = {
  createProductImageUpload: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { contentType } = req.body;

    logger.info("HTTP POST /api/uploads/product-image - Iniciado", {
      userId,
      contentType,
    });

    const result = await uploadsService.createProductImageUpload(
      userId,
      contentType
    );

    logger.info("HTTP POST /api/uploads/product-image - Concluído", {
      userId,
      path: result.path,
    });

    res.status(200).json(result);
  },

  createProfileImageUpload: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { contentType } = req.body;

    logger.info("HTTP POST /api/uploads/profile-image - Iniciado", {
      userId,
      contentType,
    });

    const result = await uploadsService.createProfileImageUpload(
      userId,
      contentType
    );

    logger.info("HTTP POST /api/uploads/profile-image - Concluído", {
      userId,
      path: result.path,
    });

    res.status(200).json(result);
  },
};

export { uploadsController };
