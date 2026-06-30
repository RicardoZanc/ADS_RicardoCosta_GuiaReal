import { productsService } from "./products.service";
import { changeRequestsService } from "../change-requests/changeRequests.service";
import { logger } from "../../utils/logger";
const productsController = {
    getFacets: async (req, res) => {
        const query = req.query;
        logger.info("HTTP GET /api/products/facets - Iniciado", query);
        const result = await productsService.getFacets(query);
        logger.info("HTTP GET /api/products/facets - Concluído", {
            tipoId: query.tipo_id,
            categoriaId: query.categoria_id,
            facetType: query.facet_type,
            paginated: Boolean(query.facet_type),
        });
        res.status(200).json(result);
    },
    search: async (req, res) => {
        const query = req.query;
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
        const result = await productsService.listOpinions(id, query, req.user?.id);
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
    update: async (req, res) => {
        const id = req.params.id;
        const user = req.user;
        logger.info("HTTP PATCH /api/products/:id - Iniciado", {
            productId: id,
            userId: user.id,
            isAdmin: user.is_admin,
        });
        if (user.is_admin) {
            const product = await productsService.update(id, req.body);
            logger.info("HTTP PATCH /api/products/:id - Concluído (admin)", {
                productId: product.id,
            });
            res.status(200).json(product);
            return;
        }
        const request = await changeRequestsService.createForProduct(user.id, id, req.body);
        logger.info("HTTP PATCH /api/products/:id - Solicitação criada", {
            productId: id,
            changeRequestId: request.id,
        });
        res.status(202).json({
            change_request_id: request.id,
            status: "PENDING",
            request,
        });
    },
};
export { productsController };
