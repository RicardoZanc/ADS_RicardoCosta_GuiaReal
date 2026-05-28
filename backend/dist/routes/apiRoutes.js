import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { nodesRoutes } from "../modules/nodes/nodes.routes";
import { productsRoutes } from "../modules/products/products.routes";
const apiRoutes = Router();
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/nodes', nodesRoutes);
apiRoutes.use('/products', productsRoutes);
export { apiRoutes };
