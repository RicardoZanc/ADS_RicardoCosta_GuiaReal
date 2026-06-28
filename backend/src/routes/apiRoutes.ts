import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { nodesRoutes } from "../modules/nodes/nodes.routes";
import { opinionsRoutes } from "../modules/opinions/opinions.routes";
import { productsRoutes } from "../modules/products/products.routes";
import { feedRoutes } from "../modules/feed/feed.routes";
import { chatsRoutes } from "../modules/chats/chats.routes";
import { uploadsRoutes } from "../modules/uploads/uploads.routes";
import { usersRoutes } from "../modules/users/users.routes";

const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/nodes', nodesRoutes);
apiRoutes.use('/opinions', opinionsRoutes);
apiRoutes.use('/products', productsRoutes);
apiRoutes.use('/feed', feedRoutes);
apiRoutes.use('/chats', chatsRoutes);
apiRoutes.use('/uploads', uploadsRoutes);
apiRoutes.use('/users', usersRoutes);

export { apiRoutes };
