import { prisma } from "../../lib/prisma";
import { fetchNodeGraph } from "../../lib/nodeGraph";
import {
  BadRequestError,
  ConflictError,
} from "../../lib/errors/BaseError";
import type { change_entity_type } from "../../generated/prisma/enums";
import {
  ensureNodeEditable,
  type NodeChangeState,
  type NodeUpdateInput,
} from "../nodes/nodes.domainRules";
import {
  buildProductTaxonomy,
  loadProductChangeState,
  type ProductChangeState,
  type ProductTaxonomy,
  type ProductUpdateInput,
} from "../products/products.domainRules";

export const MAX_REJECTION_REASON_LENGTH = 2000;

export type ChangeRequestDiffEntry = {
  field: string;
  label: string;
  from: string;
  to: string;
};

const NODE_TYPE_LABELS: Record<string, string> = {
  CATEGORIA: "Categoria",
  MARCA: "Marca",
  TECNOLOGIA: "Tecnologia",
  COMPOSICAO: "Composição",
  ATRIBUTO: "Atributo",
};

function formatImageValue(value: string | null | undefined): string {
  return value ? "Com imagem" : "Sem imagem";
}

function formatNodeList(items: { id: string; name: string }[]): string {
  if (items.length === 0) {
    return "Nenhum";
  }

  return items.map((item) => item.name).join(", ");
}

function mergeNodeState(
  previous: NodeChangeState,
  changes: NodeUpdateInput
): NodeChangeState {
  return {
    name: changes.name ?? previous.name,
    image_url:
      changes.image_url !== undefined
        ? changes.image_url
        : previous.image_url,
  };
}

async function resolveProductTaxonomy(
  nodeIds: string[]
): Promise<ProductTaxonomy> {
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

function mergeProductState(
  previous: ProductChangeState,
  changes: ProductUpdateInput,
  nextTaxonomy: ProductTaxonomy,
  nextNodeIds: string[]
): ProductChangeState {
  return {
    name: changes.name ?? previous.name,
    image_url:
      changes.image_url !== undefined
        ? changes.image_url
        : previous.image_url,
    nodeIds: nextNodeIds,
    taxonomy: nextTaxonomy,
  };
}

export async function assertNoPendingForEntity(
  entityType: change_entity_type,
  entityId: string
) {
  const pending = await prisma.change_requests.findFirst({
    where: {
      entity_type: entityType,
      entity_id: entityId,
      status: "PENDING",
    },
    select: { id: true },
  });

  if (pending) {
    throw new ConflictError(
      "Já existe uma solicitação pendente para esta entidade"
    );
  }
}

export function assertValidRejectionReason(reason?: string): string {
  const trimmed = reason?.trim() ?? "";

  if (!trimmed) {
    throw new BadRequestError("Informe o motivo da rejeição");
  }

  if (trimmed.length > MAX_REJECTION_REASON_LENGTH) {
    throw new BadRequestError(
      `O motivo da rejeição deve ter no máximo ${MAX_REJECTION_REASON_LENGTH} caracteres`
    );
  }

  return trimmed;
}

export async function buildNodeEntityLabel(entityId: string): Promise<string> {
  const node = await ensureNodeEditable(entityId);
  const typeLabel = NODE_TYPE_LABELS[node.type] ?? node.type;

  return `Nó ${typeLabel} "${node.name}"`;
}

export async function buildProductEntityLabel(entityId: string): Promise<string> {
  const product = await loadProductChangeState(entityId);
  return `Produto "${product.name}"`;
}

export function buildNodeDiff(
  previous: NodeChangeState,
  proposed: NodeChangeState
): ChangeRequestDiffEntry[] {
  const diff: ChangeRequestDiffEntry[] = [];

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

export function buildProductDiff(
  previous: ProductChangeState,
  proposed: ProductChangeState
): ChangeRequestDiffEntry[] {
  const diff: ChangeRequestDiffEntry[] = [];

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

  const taxonomyFields: Array<{
    key: keyof ProductTaxonomy;
    label: string;
    multi?: boolean;
  }> = [
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
        ? (previousValue as { id: string; name: string }[])
        : [];
      const proposedList = Array.isArray(proposedValue)
        ? (proposedValue as { id: string; name: string }[])
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

    const previousName =
      previousValue && typeof previousValue === "object" && "name" in previousValue
        ? (previousValue as { name: string }).name
        : "Nenhum";
    const proposedName =
      proposedValue && typeof proposedValue === "object" && "name" in proposedValue
        ? (proposedValue as { name: string }).name
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

export async function buildProposedNodeState(
  previous: NodeChangeState,
  changes: NodeUpdateInput
): Promise<NodeChangeState> {
  return mergeNodeState(previous, changes);
}

export async function buildProposedProductState(
  previous: ProductChangeState,
  changes: ProductUpdateInput
): Promise<ProductChangeState> {
  const nextNodeIds = changes.nodeIds ?? previous.nodeIds;
  const nextTaxonomy = await resolveProductTaxonomy(nextNodeIds);

  return mergeProductState(previous, changes, nextTaxonomy, nextNodeIds);
}
