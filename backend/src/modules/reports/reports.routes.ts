import { Router } from "express";
import { reportsController } from "./reports.controller";
import {
  createReportSchema,
  listReportsSchema,
  updateReportSchema,
} from "./reports.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.middleware";

const reportsRoutes = Router();

reportsRoutes.post(
  "/",
  authenticateJwt,
  validate(createReportSchema),
  reportsController.create
);

reportsRoutes.get(
  "/",
  authenticateJwt,
  requireAdmin,
  validate(listReportsSchema),
  reportsController.list
);

reportsRoutes.patch(
  "/:id",
  authenticateJwt,
  requireAdmin,
  validate(updateReportSchema),
  reportsController.update
);

export { reportsRoutes };
