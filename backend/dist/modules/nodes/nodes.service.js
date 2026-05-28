import { prisma } from "../../lib/prisma";
import { ConflictError } from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
import { resolveNodeCreationDependencies } from "./nodes.domainRules";
function isUniqueConstraintError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002");
}
const create = async (input) => {
    logger.debug("Criação de nó: payload recebido", {
        type: input.type,
        name: input.name,
    });
    const data = await resolveNodeCreationDependencies(input);
    try {
        const node = await prisma.nodes.create({
            data: {
                ...data,
                type: data.type,
            },
            select: {
                id: true,
                name: true,
                type: true,
                parent_id: true,
                wikidata_id: true,
                created_at: true,
            },
        });
        logger.debug("Criação de nó: persistência concluída", {
            nodeId: node.id,
            type: node.type,
        });
        return node;
    }
    catch (error) {
        if (isUniqueConstraintError(error)) {
            logger.warn("Criação de nó rejeitada: conflito de unicidade", {
                type: input.type,
                name: input.name,
            });
            throw new ConflictError("Já existe um nó com os mesmos dados únicos");
        }
        throw error;
    }
};
export const nodesService = {
    create,
};
