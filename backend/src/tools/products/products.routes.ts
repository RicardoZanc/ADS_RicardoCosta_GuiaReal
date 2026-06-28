import { Router } from "express";
import { productsToolController } from "./products.controller";
import { getProductNodesSchema } from "./products.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateToolApiKey } from "../../middlewares/toolAuth.middleware";

const productsToolRoutes = Router();

productsToolRoutes.use(authenticateToolApiKey);

productsToolRoutes.get(
  "/:product_id/nodes",
  validate(getProductNodesSchema),
  productsToolController.listProductNodes
);

export { productsToolRoutes };
