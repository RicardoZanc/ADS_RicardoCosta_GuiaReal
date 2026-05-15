import { Router } from "express";
import { authController } from "./auth.controller";
import { signupSchema, loginSchema, refreshSchema, } from "./auth.schema";
import { validate } from "../../middlewares/validate";
const authRoutes = Router();
authRoutes.post("/signup", validate(signupSchema), authController.signup);
authRoutes.post("/login", validate(loginSchema), authController.login);
authRoutes.post("/refresh", validate(refreshSchema), authController.refresh);
export { authRoutes };
