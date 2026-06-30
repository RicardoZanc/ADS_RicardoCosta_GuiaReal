import { Router } from "express";
import { searchController } from "./search.controller";
import { globalSearchSchema } from "./search.schema";
import { validate } from "../../middlewares/validate.middleware";
import { optionalAuthenticateJwt } from "../../middlewares/auth.middleware";
const searchRoutes = Router();
searchRoutes.get("/", optionalAuthenticateJwt, validate(globalSearchSchema), searchController.globalSearch);
export { searchRoutes };
