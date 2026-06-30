import { Router } from "express";
import { adminRequestsController } from "./adminRequests.controller";
import {
  createAdminRequestSchema,
  listAdminRequestsSchema,
  updateAdminRequestSchema,
} from "./adminRequests.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.middleware";

const adminRequestsRoutes = Router();

adminRequestsRoutes.post(
  "/",
  authenticateJwt,
  validate(createAdminRequestSchema),
  adminRequestsController.create
);

adminRequestsRoutes.get(
  "/me",
  authenticateJwt,
  adminRequestsController.listMine
);

adminRequestsRoutes.get(
  "/",
  authenticateJwt,
  requireAdmin,
  validate(listAdminRequestsSchema),
  adminRequestsController.list
);

adminRequestsRoutes.patch(
  "/:id",
  authenticateJwt,
  requireAdmin,
  validate(updateAdminRequestSchema),
  adminRequestsController.update
);

export { adminRequestsRoutes };
