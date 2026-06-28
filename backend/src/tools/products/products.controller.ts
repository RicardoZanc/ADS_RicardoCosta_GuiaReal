import { Request, Response } from "express";
import { productsToolService } from "./products.service";
import { logger } from "../../utils/logger";

const productsToolController = {
  listProductNodes: async (req: Request, res: Response) => {
    const productId = req.params.product_id as string;

    logger.info("HTTP GET /tool/products/:product_id/nodes - Iniciado", {
      productId,
    });

    const result = await productsToolService.listProductNodes(productId);

    logger.info("HTTP GET /tool/products/:product_id/nodes - Concluído", {
      productId,
      nodeCount: result.nodes.length,
    });

    res.status(200).json(result);
  },
};

export { productsToolController };
