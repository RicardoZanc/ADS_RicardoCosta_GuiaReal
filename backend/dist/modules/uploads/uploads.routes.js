import { Router } from "express";
import { uploadsController } from "./uploads.controller";
import { createProductImageUploadSchema, createProfileImageUploadSchema, } from "./uploads.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";
const uploadsRoutes = Router();
uploadsRoutes.post("/product-image", authenticateJwt, validate(createProductImageUploadSchema), uploadsController.createProductImageUpload);
uploadsRoutes.post("/profile-image", authenticateJwt, validate(createProfileImageUploadSchema), uploadsController.createProfileImageUpload);
export { uploadsRoutes };
