import { Router } from "express";
import { productsController } from "./products.controller";
import {
  createProductSchema,
  getProductSchema,
  listProductOpinionsSchema,
  productFacetsSchema,
  productSearchSchema,
  updateProductSchema,
} from "./products.schema";
import { validate } from "../../middlewares/validate.middleware";
import {
  authenticateJwt,
  optionalAuthenticateJwt,
} from "../../middlewares/auth.middleware";

const productsRoutes = Router();

productsRoutes.get(
  "/facets",
  optionalAuthenticateJwt,
  validate(productFacetsSchema),
  productsController.getFacets
);

productsRoutes.get(
  "/search",
  optionalAuthenticateJwt,
  validate(productSearchSchema),
  productsController.search
);

productsRoutes.get(
  "/:id/opinions",
  optionalAuthenticateJwt,
  validate(listProductOpinionsSchema),
  productsController.listOpinions
);

productsRoutes.get(
  "/:id",
  optionalAuthenticateJwt,
  validate(getProductSchema),
  productsController.getById
);

productsRoutes.post(
  "/",
  authenticateJwt,
  validate(createProductSchema),
  productsController.create
);

productsRoutes.patch(
  "/:id",
  authenticateJwt,
  validate(updateProductSchema),
  productsController.update
);

export { productsRoutes };
