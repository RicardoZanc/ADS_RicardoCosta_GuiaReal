import { Router } from "express";
import { chatsController } from "./chats.controller";
import { createChatSchema } from "./chats.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const chatsRoutes = Router();

chatsRoutes.post(
  "/",
  authenticateJwt,
  validate(createChatSchema),
  chatsController.create
);

export { chatsRoutes };
