import { Router } from "express";
import { nodesController } from "./nodes.controller";
import { createNodeSchema, listNodesSchema } from "./nodes.schema";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateJwt } from "../../middlewares/auth.middleware";
const nodesRoutes = Router();
nodesRoutes.get("/", authenticateJwt, validate(listNodesSchema), nodesController.list);
nodesRoutes.post("/", authenticateJwt, validate(createNodeSchema), nodesController.create);
export { nodesRoutes };
