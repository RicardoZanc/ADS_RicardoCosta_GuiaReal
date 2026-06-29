import { Router } from "express";
import { feedController } from "./feed.controller";
import { listFeedSchema } from "./feed.schema";
import { validate } from "../../middlewares/validate.middleware";
import { optionalAuthenticateJwt } from "../../middlewares/auth.middleware";
const feedRoutes = Router();
feedRoutes.get("/", optionalAuthenticateJwt, validate(listFeedSchema), feedController.list);
export { feedRoutes };
