import { prisma } from "../../lib/prisma";
import { logger } from "../../utils/logger";
import { ensureNodeExists, ensureOpinionExists, ensureProductExists, } from "./opinions.domainRules";
const createOnProduct = async (productId, userId, input) => {
    logger.debug("Opinião em produto: payload recebido", { productId, userId });
    await ensureProductExists(productId);
    const opinion = await prisma.opinions.create({
        data: {
            product_id: productId,
            user_id: userId,
            title: input.title,
            content: input.content,
            is_eligible_for_ai: true,
        },
        select: {
            id: true,
            user_id: true,
            product_id: true,
            node_id: true,
            title: true,
            content: true,
            is_eligible_for_ai: true,
            created_at: true,
        },
    });
    logger.debug("Opinião em produto: persistência concluída", {
        opinionId: opinion.id,
        productId,
    });
    return opinion;
};
const createOnNode = async (nodeId, userId, input) => {
    logger.debug("Opinião em nó: payload recebido", { nodeId, userId });
    await ensureNodeExists(nodeId);
    const opinion = await prisma.opinions.create({
        data: {
            node_id: nodeId,
            user_id: userId,
            title: input.title,
            content: input.content,
            is_eligible_for_ai: true,
        },
        select: {
            id: true,
            user_id: true,
            product_id: true,
            node_id: true,
            title: true,
            content: true,
            is_eligible_for_ai: true,
            created_at: true,
        },
    });
    logger.debug("Opinião em nó: persistência concluída", {
        opinionId: opinion.id,
        nodeId,
    });
    return opinion;
};
const createThread = async (opinionId, userId, input) => {
    logger.debug("Thread de opinião: payload recebido", { opinionId, userId });
    await ensureOpinionExists(opinionId);
    const thread = await prisma.discussion_threads.create({
        data: {
            opinion_id: opinionId,
            user_id: userId,
            content: input.content,
            parent_interaction_id: null,
        },
        select: {
            id: true,
            opinion_id: true,
            parent_interaction_id: true,
            user_id: true,
            content: true,
            cached_upvotes: true,
            status: true,
            created_at: true,
        },
    });
    logger.debug("Thread de opinião: persistência concluída", {
        threadId: thread.id,
        opinionId,
    });
    return thread;
};
export const opinionsService = {
    createOnProduct,
    createOnNode,
    createThread,
};
