import { Router } from "express";
import { technicalFactsRoutes } from "../tools/technical_facts/technical_facts.routes";

const toolRoutes = Router();

toolRoutes.use("/technical-facts", technicalFactsRoutes);

export { toolRoutes };
