import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { nodesRoutes } from "../modules/nodes/nodes.routes";
import { opinionsRoutes } from "../modules/opinions/opinions.routes";
import { productsRoutes } from "../modules/products/products.routes";
import { feedRoutes } from "../modules/feed/feed.routes";
import { chatsRoutes } from "../modules/chats/chats.routes";
import { uploadsRoutes } from "../modules/uploads/uploads.routes";
import { usersRoutes } from "../modules/users/users.routes";
import { reportsRoutes } from "../modules/reports/reports.routes";
import { adminRequestsRoutes } from "../modules/admin-requests/adminRequests.routes";
import { changeRequestsRoutes } from "../modules/change-requests/changeRequests.routes";
import { evidenceRoutes } from "../modules/evidence/evidence.routes";
import { searchRoutes } from "../modules/search/search.routes";

const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/nodes', nodesRoutes);
apiRoutes.use('/opinions', opinionsRoutes);
apiRoutes.use('/products', productsRoutes);
apiRoutes.use('/feed', feedRoutes);
apiRoutes.use('/chats', chatsRoutes);
apiRoutes.use('/uploads', uploadsRoutes);
apiRoutes.use('/users', usersRoutes);
apiRoutes.use('/reports', reportsRoutes);
apiRoutes.use('/admin-requests', adminRequestsRoutes);
apiRoutes.use('/change-requests', changeRequestsRoutes);
apiRoutes.use('/evidence', evidenceRoutes);
apiRoutes.use('/search', searchRoutes);

export { apiRoutes };
