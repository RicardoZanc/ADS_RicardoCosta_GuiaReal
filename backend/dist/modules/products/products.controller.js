import { productsService } from "./products.service";
import { logger } from "../../utils/logger";
const productsController = {
    getById: async (req, res) => {
        const id = req.params.id;
        logger.info("HTTP GET /api/products/:id - Iniciado", { productId: id });
        const product = await productsService.getById(id);
        logger.info("HTTP GET /api/products/:id - Concluído", { productId: id });
        res.status(200).json(product);
    },
    listOpinions: async (req, res) => {
        const id = req.params.id;
        const query = req.query;
        logger.info("HTTP GET /api/products/:id/opinions - Iniciado", {
            productId: id,
            scope: query.scope,
            nodeId: query.node_id,
            page: query.page,
            limit: query.limit,
        });
        const result = await productsService.listOpinions(id, query, req.user.id);
        logger.info("HTTP GET /api/products/:id/opinions - Concluído", {
            productId: id,
            scope: query.scope,
            total: result.pagination.total,
        });
        res.status(200).json(result);
    },
    create: async (req, res) => {
        logger.info("HTTP POST /api/products - Iniciado", {
            name: req.body.name,
            nodeCount: req.body.nodeIds?.length,
        });
        const product = await productsService.create(req.body);
        logger.info("HTTP POST /api/products - Concluído", {
            productId: product.id,
        });
        res.status(201).json(product);
    },
};
export { productsController };
