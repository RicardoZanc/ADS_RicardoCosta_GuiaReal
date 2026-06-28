import { Router } from "express";
import { technicalFactsController } from "./technical_facts.controller";
import {
  createTechnicalFactSchema,
  listPendingQueueSchema,
  listTechnicalFactsByNodeSchema,
  markQueueItemProcessedSchema,
} from "./technical_facts.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateToolApiKey } from "../../middlewares/toolAuth.middleware";

const technicalFactsRoutes = Router();

technicalFactsRoutes.use(authenticateToolApiKey);

technicalFactsRoutes.get(
  "/pending-queue",
  validate(listPendingQueueSchema),
  technicalFactsController.listPendingQueue
);

technicalFactsRoutes.post(
  "/",
  validate(createTechnicalFactSchema),
  technicalFactsController.createFact
);

technicalFactsRoutes.patch(
  "/queue/:source_type/:source_id/processed",
  validate(markQueueItemProcessedSchema),
  technicalFactsController.markQueueItemProcessed
);

technicalFactsRoutes.get(
  "/",
  validate(listTechnicalFactsByNodeSchema),
  technicalFactsController.listByNode
);

export { technicalFactsRoutes };
