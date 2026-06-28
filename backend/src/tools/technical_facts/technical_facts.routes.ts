import { Router } from "express";
import { technicalFactsController } from "./technical_facts.controller";
import {
  createTechnicalFactSchema,
  listPendingInteractionsSchema,
  listTechnicalFactsByNodeSchema,
  markInteractionProcessedSchema,
} from "./technical_facts.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateToolApiKey } from "../../middlewares/toolAuth.middleware";

const technicalFactsRoutes = Router();

technicalFactsRoutes.use(authenticateToolApiKey);

technicalFactsRoutes.get(
  "/pending-interactions",
  validate(listPendingInteractionsSchema),
  technicalFactsController.listPendingInteractions
);

technicalFactsRoutes.post(
  "/",
  validate(createTechnicalFactSchema),
  technicalFactsController.createFact
);

technicalFactsRoutes.patch(
  "/interactions/:thread_id/processed",
  validate(markInteractionProcessedSchema),
  technicalFactsController.markInteractionProcessed
);

technicalFactsRoutes.get(
  "/",
  validate(listTechnicalFactsByNodeSchema),
  technicalFactsController.listByNode
);

export { technicalFactsRoutes };
