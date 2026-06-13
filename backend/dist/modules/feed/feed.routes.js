import { Router } from "express";
import { feedController } from "./feed.controller";
import { listFeedSchema } from "./feed.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";
const feedRoutes = Router();
feedRoutes.get("/", authenticateJwt, validate(listFeedSchema), feedController.list);
export { feedRoutes };
