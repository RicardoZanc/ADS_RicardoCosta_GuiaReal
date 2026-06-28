import { Router } from "express";
import { uploadsController } from "./uploads.controller";
import { createProductImageUploadSchema } from "./uploads.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const uploadsRoutes = Router();

uploadsRoutes.post(
  "/product-image",
  authenticateJwt,
  validate(createProductImageUploadSchema),
  uploadsController.createProductImageUpload
);

export { uploadsRoutes };
