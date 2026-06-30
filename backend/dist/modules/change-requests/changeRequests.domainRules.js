import { prisma } from "../../lib/prisma";
import { fetchNodeGraph } from "../../lib/nodeGraph";
import { BadRequestError, ConflictError, } from "../../lib/errors/BaseError";
import { ensureNodeEditable, } from "../nodes/nodes.domainRules";
import { buildProductTaxonomy, loadProductChangeState, } from "../products/products.domainRules";
export const MAX_REJECTION_REASON_LENGTH = 2000;
const NODE_TYPE_LABELS = {
    CATEGORIA: "Categoria",
    MARCA: "Marca",
    TECNOLOGIA: "Tecnologia",
    COMPOSICAO: "Composição",
    ATRIBUTO: "Atributo",
};
function formatImageValue(value) {
    return value ? "Com imagem" : "Sem imagem";
}
function formatNodeList(items) {
    if (items.length === 0) {
        return "Nenhum";
    }
    return items.map((item) => item.name).join(", ");
}
function mergeNodeState(previous, changes) {
    return {
        name: changes.name ?? previous.name,
        image_url: changes.image_url !== undefined
            ? changes.image_url
            : previous.image_url,
    };
}
async function resolveProductTaxonomy(nodeIds) {
    const nodes = await prisma.nodes.findMany({
        where: { id: { in: nodeIds } },
        select: {
            id: true,
            name: true,
            type: true,
            parent_id: true,
        },
    });
    const nodeById = await fetchNodeGraph(nodes.map((node) => node.id));
    return buildProductTaxonomy(nodes, nodeById);
}
function mergeProductState(previous, changes, nextTaxonomy, nextNodeIds) {
    return {
        name: changes.name ?? previous.name,
        image_url: changes.image_url !== undefined
            ? changes.image_url
            : previous.image_url,
        nodeIds: nextNodeIds,
        taxonomy: nextTaxonomy,
    };
}
export async function assertNoPendingForEntity(entityType, entityId) {
    const pending = await prisma.change_requests.findFirst({
        where: {
            entity_type: entityType,
            entity_id: entityId,
            status: "PENDING",
        },
        select: { id: true },
    });
    if (pending) {
        throw new ConflictError("Já existe uma solicitação pendente para esta entidade");
    }
}
export function assertValidRejectionReason(reason) {
    const trimmed = reason?.trim() ?? "";
    if (!trimmed) {
        throw new BadRequestError("Informe o motivo da rejeição");
    }
    if (trimmed.length > MAX_REJECTION_REASON_LENGTH) {
        throw new BadRequestError(`O motivo da rejeição deve ter no máximo ${MAX_REJECTION_REASON_LENGTH} caracteres`);
    }
    return trimmed;
}
export async function buildNodeEntityLabel(entityId) {
    const node = await ensureNodeEditable(entityId);
    const typeLabel = NODE_TYPE_LABELS[node.type] ?? node.type;
    return `Nó ${typeLabel} "${node.name}"`;
}
export async function buildProductEntityLabel(entityId) {
    const product = await loadProductChangeState(entityId);
    return `Produto "${product.name}"`;
}
export function buildNodeDiff(previous, proposed) {
    const diff = [];
    if (previous.name !== proposed.name) {
        diff.push({
            field: "name",
            label: "Nome",
            from: previous.name,
            to: proposed.name,
        });
    }
    if (previous.image_url !== proposed.image_url) {
        diff.push({
            field: "image_url",
            label: "Imagem",
            from: formatImageValue(previous.image_url),
            to: formatImageValue(proposed.image_url),
        });
    }
    return diff;
}
export function buildProductDiff(previous, proposed) {
    const diff = [];
    if (previous.name !== proposed.name) {
        diff.push({
            field: "name",
            label: "Nome",
            from: previous.name,
            to: proposed.name,
        });
    }
    if (previous.image_url !== proposed.image_url) {
        diff.push({
            field: "image_url",
            label: "Imagem",
            from: formatImageValue(previous.image_url),
            to: formatImageValue(proposed.image_url),
        });
    }
    const taxonomyFields = [
        { key: "categoria", label: "Categoria" },
        { key: "marca", label: "Marca" },
        { key: "tecnologias", label: "Tecnologias", multi: true },
        { key: "composicoes", label: "Composições", multi: true },
        { key: "atributos", label: "Atributos", multi: true },
    ];
    for (const field of taxonomyFields) {
        const previousValue = previous.taxonomy[field.key];
        const proposedValue = proposed.taxonomy[field.key];
        if (field.multi) {
            const previousList = Array.isArray(previousValue)
                ? previousValue
                : [];
            const proposedList = Array.isArray(proposedValue)
                ? proposedValue
                : [];
            const previousNames = previousList.map((item) => item.name).join("|");
            const proposedNames = proposedList.map((item) => item.name).join("|");
            if (previousNames !== proposedNames) {
                diff.push({
                    field: field.key,
                    label: field.label,
                    from: formatNodeList(previousList),
                    to: formatNodeList(proposedList),
                });
            }
            continue;
        }
        const previousName = previousValue && typeof previousValue === "object" && "name" in previousValue
            ? previousValue.name
            : "Nenhum";
        const proposedName = proposedValue && typeof proposedValue === "object" && "name" in proposedValue
            ? proposedValue.name
            : "Nenhum";
        if (previousName !== proposedName) {
            diff.push({
                field: field.key,
                label: field.label,
                from: previousName,
                to: proposedName,
            });
        }
    }
    return diff;
}
export async function buildProposedNodeState(previous, changes) {
    return mergeNodeState(previous, changes);
}
export async function buildProposedProductState(previous, changes) {
    const nextNodeIds = changes.nodeIds ?? previous.nodeIds;
    const nextTaxonomy = await resolveProductTaxonomy(nextNodeIds);
    return mergeProductState(previous, changes, nextTaxonomy, nextNodeIds);
}
