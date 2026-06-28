import { Router } from "express";
import { chatsController } from "./chats.controller";
import {
  createChatSchema,
  getChatSchema,
  listChatsSchema,
  sendMessageSchema,
} from "./chats.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const chatsRoutes = Router();

chatsRoutes.get(
  "/",
  authenticateJwt,
  validate(listChatsSchema),
  chatsController.list
);

chatsRoutes.get(
  "/:id",
  authenticateJwt,
  validate(getChatSchema),
  chatsController.getById
);

chatsRoutes.post(
  "/",
  authenticateJwt,
  validate(createChatSchema),
  chatsController.create
);

chatsRoutes.post(
  "/:id/messages",
  authenticateJwt,
  validate(sendMessageSchema),
  chatsController.sendMessage
);

export { chatsRoutes };
