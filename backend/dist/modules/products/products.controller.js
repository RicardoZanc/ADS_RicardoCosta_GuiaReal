import { productsService } from "./products.service";
import { logger } from "../../utils/logger";
const productsController = {
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
