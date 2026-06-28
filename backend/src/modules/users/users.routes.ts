import { Router } from "express";
import { usersController } from "./users.controller";
import {
  getUserByUsernameSchema,
  listUserInteractionsSchema,
  updateUserMeSchema,
} from "./users.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const usersRoutes = Router();

usersRoutes.patch(
  "/me",
  authenticateJwt,
  validate(updateUserMeSchema),
  usersController.updateMe
);

usersRoutes.get(
  "/:username/interactions",
  authenticateJwt,
  validate(listUserInteractionsSchema),
  usersController.listInteractions
);

usersRoutes.get(
  "/:username",
  authenticateJwt,
  validate(getUserByUsernameSchema),
  usersController.getByUsername
);

export { usersRoutes };
