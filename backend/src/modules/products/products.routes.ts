import { Router } from "express";
import { productsController } from "./products.controller";
import {
  createProductSchema,
  getProductSchema,
  listProductOpinionsSchema,
  productFacetsSchema,
  productSearchSchema,
} from "./products.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const productsRoutes = Router();

productsRoutes.get(
  "/facets",
  authenticateJwt,
  validate(productFacetsSchema),
  productsController.getFacets
);

productsRoutes.get(
  "/search",
  authenticateJwt,
  validate(productSearchSchema),
  productsController.search
);

productsRoutes.get(
  "/:id/opinions",
  authenticateJwt,
  validate(listProductOpinionsSchema),
  productsController.listOpinions
);

productsRoutes.get(
  "/:id",
  authenticateJwt,
  validate(getProductSchema),
  productsController.getById
);

productsRoutes.post(
  "/",
  authenticateJwt,
  validate(createProductSchema),
  productsController.create
);

export { productsRoutes };
