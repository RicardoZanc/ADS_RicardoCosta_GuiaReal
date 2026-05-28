import { prisma } from "../../lib/prisma";
import { ConflictError } from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
import { ensureEanAvailable, validateProductNodeDependencies, } from "./products.domainRules";
function isUniqueConstraintError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002");
}
const create = async (input) => {
    logger.debug("Cadastro de produto: payload recebido", {
        name: input.name,
        hasEan: Boolean(input.ean),
        nodeCount: input.nodeIds.length,
    });
    await ensureEanAvailable(input.ean);
    const validNodeIds = await validateProductNodeDependencies(input.nodeIds);
    try {
        const product = await prisma.products.create({
            data: {
                name: input.name,
                ean: input.ean,
                brand_name: input.brand_name,
                image_url: input.image_url,
                product_nodes: {
                    create: validNodeIds.map((nodeId) => ({
                        node_id: nodeId,
                    })),
                },
            },
            select: {
                id: true,
                name: true,
                ean: true,
                brand_name: true,
                image_url: true,
                created_at: true,
                product_nodes: {
                    select: {
                        node_id: true,
                    },
                },
            },
        });
        logger.debug("Cadastro de produto: persistência concluída", {
            productId: product.id,
            nodeCount: product.product_nodes.length,
        });
        return {
            ...product,
            nodeIds: product.product_nodes.map((item) => item.node_id),
        };
    }
    catch (error) {
        if (isUniqueConstraintError(error)) {
            logger.warn("Cadastro de produto rejeitado: conflito de unicidade", {
                ean: input.ean,
            });
            throw new ConflictError("Produto já existe com os mesmos dados únicos");
        }
        throw error;
    }
};
export const productsService = {
    create,
};
