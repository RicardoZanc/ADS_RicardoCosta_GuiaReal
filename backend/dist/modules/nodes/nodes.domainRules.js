import { prisma } from "../../lib/prisma";
import { BadRequestError, ConflictError, NotFoundError, } from "../../lib/errors/BaseError";
import { logger } from "../../utils/logger";
const ROOT_TYPE = "ROOT";
const TIPO_TYPE = "TIPO";
const UNRENAMABLE_TYPES = new Set([ROOT_TYPE, TIPO_TYPE]);
async function getRootNodeId() {
    const roots = await prisma.nodes.findMany({
        where: { type: ROOT_TYPE },
        select: { id: true },
    });
    if (roots.length === 0) {
        logger.error("Criação de nó rejeitada: ROOT não encontrado");
        throw new NotFoundError("Nó ROOT não encontrado");
    }
    if (roots.length > 1) {
        logger.error("Criação de nó rejeitada: múltiplos ROOT encontrados", {
            rootCount: roots.length,
        });
        throw new BadRequestError("Configuração inválida: existe mais de um nó ROOT no sistema");
    }
    return roots[0].id;
}
async function ensureParentIsTipo(parentId) {
    const parentNode = await prisma.nodes.findUnique({
        where: { id: parentId },
        select: { id: true, type: true },
    });
    if (!parentNode) {
        logger.warn("Criação de categoria rejeitada: parent_id não encontrado", {
            parentId,
        });
        throw new NotFoundError("Parent ID não encontrado");
    }
    if (parentNode.type !== TIPO_TYPE) {
        logger.warn("Criação de categoria rejeitada: parent_id não é TIPO", {
            parentId,
            parentType: parentNode.type,
        });
        throw new BadRequestError("Para criar CATEGORIA, o parent_id deve apontar para um nó do tipo TIPO");
    }
}
async function ensureNodeNameAvailable(type, name, parentId, excludeId) {
    const existing = await prisma.nodes.findFirst({
        where: {
            type: type,
            parent_id: parentId,
            name: { equals: name, mode: "insensitive" },
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    });
    if (existing) {
        logger.warn("Operação de nó rejeitada: nome duplicado para o tipo", {
            type,
            name,
        });
        throw new ConflictError("Já existe um nó com este nome para o tipo informado");
    }
}
export async function ensureNodeRenamable(id, name) {
    const node = await prisma.nodes.findUnique({
        where: { id },
        select: { id: true, type: true, parent_id: true },
    });
    if (!node) {
        logger.warn("Renomeação de nó rejeitada: nó não encontrado", { id });
        throw new NotFoundError("Nó não encontrado");
    }
    if (UNRENAMABLE_TYPES.has(node.type)) {
        logger.warn("Renomeação de nó rejeitada: tipo de infraestrutura", {
            id,
            type: node.type,
        });
        throw new BadRequestError("Nós do tipo ROOT ou TIPO não podem ser renomeados");
    }
    await ensureNodeNameAvailable(node.type, name, node.parent_id ?? "", id);
    return node;
}
export async function resolveNodeCreationDependencies(input) {
    logger.debug("Resolução de dependências para criação de nó iniciada", {
        type: input.type,
        parentId: input.parent_id,
    });
    const rootId = await getRootNodeId();
    const flatRootChildrenTypes = [
        "TIPO",
        "MARCA",
        "TECNOLOGIA",
        "COMPOSICAO",
        "ATRIBUTO",
    ];
    if (input.type === "CATEGORIA") {
        if (!input.parent_id) {
            logger.warn("Criação de categoria rejeitada: parent_id ausente");
            throw new BadRequestError("Para criar CATEGORIA, o campo parent_id é obrigatório e deve referenciar um TIPO");
        }
        await ensureParentIsTipo(input.parent_id);
        await ensureNodeNameAvailable(input.type, input.name, input.parent_id);
        return {
            name: input.name,
            type: input.type,
            parent_id: input.parent_id,
            wikidata_id: input.wikidata_id,
        };
    }
    if (flatRootChildrenTypes.includes(input.type)) {
        await ensureNodeNameAvailable(input.type, input.name, rootId);
        return {
            name: input.name,
            type: input.type,
            parent_id: rootId,
            wikidata_id: input.wikidata_id,
        };
    }
    logger.warn("Criação de nó rejeitada: tipo não suportado", {
        type: input.type,
    });
    throw new BadRequestError("Tipo de nó não suportado para criação");
}
export async function resolveNodeSearchQuery(query) {
    if (!query.tipo_id) {
        return query;
    }
    logger.debug("Resolução de filtros para busca de categorias por TIPO", {
        tipoId: query.tipo_id,
        q: query.q,
    });
    await ensureParentIsTipo(query.tipo_id);
    return {
        ...query,
        type: "CATEGORIA",
        parent_id: query.tipo_id,
    };
}
