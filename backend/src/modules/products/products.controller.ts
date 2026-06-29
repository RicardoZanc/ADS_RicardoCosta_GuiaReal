import { Request, Response } from "express";
import { productsService } from "./products.service";
import type {
  ListProductOpinionsQuery,
  ProductFacetsQuery,
  ProductSearchQuery,
} from "./products.schema";
import { logger } from "../../utils/logger";

const productsController = {
  getFacets: async (req: Request, res: Response) => {
    const query = req.query as unknown as ProductFacetsQuery;
    logger.info("HTTP GET /api/products/facets - Iniciado", query);
    const facets = await productsService.getFacets(query);
    logger.info("HTTP GET /api/products/facets - Concluído", {
      tipoId: query.tipo_id,
      categoriaId: query.categoria_id,
    });
    res.status(200).json(facets);
  },
  search: async (req: Request, res: Response) => {
    const query = req.query as unknown as ProductSearchQuery;
    logger.info("HTTP GET /api/products/search - Iniciado", {
      tipoId: query.tipo_id,
      categoriaId: query.categoria_id,
      nodeCount: query.node_ids?.length ?? 0,
      q: query.q,
      page: query.page,
      limit: query.limit,
    });
    const result = await productsService.search(query);
    logger.info("HTTP GET /api/products/search - Concluído", {
      total: result.pagination.total,
      returned: result.data.length,
    });
    res.status(200).json(result);
  },
  getById: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    logger.info("HTTP GET /api/products/:id - Iniciado", { productId: id });
    const product = await productsService.getById(id);
    logger.info("HTTP GET /api/products/:id - Concluído", { productId: id });
    res.status(200).json(product);
  },
  listOpinions: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const query = req.query as unknown as ListProductOpinionsQuery;
    logger.info("HTTP GET /api/products/:id/opinions - Iniciado", {
      productId: id,
      scope: query.scope,
      nodeId: query.node_id,
      page: query.page,
      limit: query.limit,
    });
    const result = await productsService.listOpinions(id, query, req.user?.id);
    logger.info("HTTP GET /api/products/:id/opinions - Concluído", {
      productId: id,
      scope: query.scope,
      total: result.pagination.total,
    });
    res.status(200).json(result);
  },
  create: async (req: Request, res: Response) => {
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
