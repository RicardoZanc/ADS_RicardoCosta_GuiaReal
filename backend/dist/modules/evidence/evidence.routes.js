import { Router } from "express";
import { evidenceController } from "./evidence.controller";
import { previewEvidenceSchema } from "./evidence.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";
const evidenceRoutes = Router();
evidenceRoutes.post("/preview", authenticateJwt, validate(previewEvidenceSchema), evidenceController.preview);
export { evidenceRoutes };
