import { Router } from "express";
import { chatToolController } from "./chat.controller";
import { agentResponseSchema } from "../../modules/chats/chats.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateToolApiKey } from "../../middlewares/toolAuth.middleware";
const chatRoutes = Router();
chatRoutes.use(authenticateToolApiKey);
chatRoutes.post("/agent-response", validate(agentResponseSchema), chatToolController.agentResponse);
export { chatRoutes };
