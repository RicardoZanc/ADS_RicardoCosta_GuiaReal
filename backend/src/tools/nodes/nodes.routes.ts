import { Router } from "express";
import { nodesToolController } from "./nodes.controller";
import { searchNodesSchema } from "./nodes.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateToolApiKey } from "../../middlewares/toolAuth.middleware";

const nodesToolRoutes = Router();

nodesToolRoutes.use(authenticateToolApiKey);

nodesToolRoutes.get(
  "/search",
  validate(searchNodesSchema),
  nodesToolController.search
);

export { nodesToolRoutes };
