import { Router } from "express";
import { technicalFactsRoutes } from "../tools/technical_facts/technical_facts.routes";
import { chatRoutes } from "../tools/chat/chat.routes";
import { productsToolRoutes } from "../tools/products/products.routes";
const toolRoutes = Router();
toolRoutes.use("/technical-facts", technicalFactsRoutes);
toolRoutes.use("/chat", chatRoutes);
toolRoutes.use("/products", productsToolRoutes);
export { toolRoutes };
