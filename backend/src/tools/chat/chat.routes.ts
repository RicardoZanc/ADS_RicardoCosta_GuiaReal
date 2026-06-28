import { Router } from "express";
import { chatToolController } from "./chat.controller";
import {
  agentProgressSchema,
  agentResponseSchema,
} from "../../modules/chats/chats.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateToolApiKey } from "../../middlewares/toolAuth.middleware";

const chatRoutes = Router();

chatRoutes.use(authenticateToolApiKey);

chatRoutes.post(
  "/agent-response",
  validate(agentResponseSchema),
  chatToolController.agentResponse
);

chatRoutes.post(
  "/agent-progress",
  validate(agentProgressSchema),
  chatToolController.agentProgress
);

export { chatRoutes };
