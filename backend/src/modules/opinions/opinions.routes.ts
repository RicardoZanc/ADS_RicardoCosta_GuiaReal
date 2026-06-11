import { Router } from "express";
import { opinionsController } from "./opinions.controller";
import {
  createNodeOpinionSchema,
  createOpinionThreadSchema,
  createProductOpinionSchema,
} from "./opinions.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const opinionsRoutes = Router();

opinionsRoutes.post(
  "/products/:product_id",
  authenticateJwt,
  validate(createProductOpinionSchema),
  opinionsController.createOnProduct
);

opinionsRoutes.post(
  "/nodes/:node_id",
  authenticateJwt,
  validate(createNodeOpinionSchema),
  opinionsController.createOnNode
);

opinionsRoutes.post(
  "/:opinion_id/threads",
  authenticateJwt,
  validate(createOpinionThreadSchema),
  opinionsController.createThread
);

export { opinionsRoutes };
