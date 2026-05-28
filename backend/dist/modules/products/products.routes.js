import { Router } from "express";
import { productsController } from "./products.controller";
import { createProductSchema } from "./products.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";
const productsRoutes = Router();
productsRoutes.post("/", authenticateJwt, validate(createProductSchema), productsController.create);
export { productsRoutes };
