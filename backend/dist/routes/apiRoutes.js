import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
const apiRoutes = Router();
apiRoutes.use('/auth', authRoutes);
export { apiRoutes };
