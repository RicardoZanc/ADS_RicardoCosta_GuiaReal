import { prisma } from "../../lib/prisma";
import {
  BadRequestError,
  NotFoundError,
} from "../../lib/errors/BaseError";
import type { change_entity_type } from "../../generated/prisma/enums";
import {
  validateNodeUpdate,
  type NodeUpdateInput,
} from "../nodes/nodes.domainRules";
import {
  validateProductUpdate,
  type ProductUpdateInput,
} from "../products/products.domainRules";
import { nodesService } from "../nodes/nodes.service";
import { productsService } from "../products/products.service";
import {
  assertNoPendingForEntity,
  assertValidRejectionReason,
  buildNodeDiff,
  buildNodeEntityLabel,
  buildProductDiff,
  buildProductEntityLabel,
  buildProposedNodeState,
  buildProposedProductState,
  type ChangeRequestDiffEntry,
} from "./changeRequests.domainRules";
import type {
  ListChangeRequestsQuery,
  ListMyChangeRequestsQuery,
  UpdateChangeRequestInput,
} from "./changeRequests.schema";

function toIsoString(date: Date | null | undefined): string {
  return (date ?? new Date(0)).toISOString();
}

type StoredChangePayload = NodeUpdateInput | ProductUpdateInput;

function mapChangeRequestItem(request: {
  id: string;
  entity_type: change_entity_type;
  entity_id: string;
  changes: unknown;
  previous_state: unknown;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  reviewed_at: Date | null;
  entity_label: string;
  diff: ChangeRequestDiffEntry[];
  users: { id: string; username: string };
  reviewer: { id: string; username: string } | null;
}) {
  return {
    id: request.id,
    entity_type: request.entity_type,
    entity_id: request.entity_id,
    entity_label: request.entity_label,
    changes: request.changes,
    previous_state: request.previous_state,
    diff: request.diff,
    status: request.status,
    rejection_reason: request.rejection_reason,
    created_at: toIsoString(request.created_at),
    reviewed_at: request.reviewed_at ? toIsoString(request.reviewed_at) : null,
    user: request.users,
    reviewer: request.reviewer,
  };
}

async function enrichRequest(request: {
  id: string;
  entity_type: change_entity_type;
  entity_id: string;
  changes: unknown;
  previous_state: unknown;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  reviewed_at: Date | null;
  users: { id: string; username: string };
  reviewer: { id: string; username: string } | null;
}) {
  let entity_label: string;
  let diff: ChangeRequestDiffEntry[];

  if (request.entity_type === "NODE") {
    entity_label = await buildNodeEntityLabel(request.entity_id);
    const proposed = await buildProposedNodeState(
      request.previous_state as Awaited<ReturnType<typeof validateNodeUpdate>>,
      request.changes as NodeUpdateInput
    );
    diff = buildNodeDiff(
      request.previous_state as Awaited<ReturnType<typeof validateNodeUpdate>>,
      proposed
    );
  } else {
    entity_label = await buildProductEntityLabel(request.entity_id);
    const proposed = await buildProposedProductState(
      request.previous_state as Awaited<
        ReturnType<typeof validateProductUpdate>
      >,
      request.changes as ProductUpdateInput
    );
    diff = buildProductDiff(
      request.previous_state as Awaited<
        ReturnType<typeof validateProductUpdate>
      >,
      proposed
    );
  }

  return mapChangeRequestItem({
    ...request,
    entity_label,
    diff,
  });
}

const createForNode = async (
  userId: string,
  entityId: string,
  changes: NodeUpdateInput
) => {
  await assertNoPendingForEntity("NODE", entityId);
  const previousState = await validateNodeUpdate(entityId, changes);

  const request = await prisma.change_requests.create({
    data: {
      user_id: userId,
      entity_type: "NODE",
      entity_id: entityId,
      changes,
      previous_state: previousState,
      status: "PENDING",
    },
    select: {
      id: true,
      entity_type: true,
      entity_id: true,
      changes: true,
      previous_state: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      reviewed_at: true,
      users: { select: { id: true, username: true } },
      reviewer: { select: { id: true, username: true } },
    },
  });

  return enrichRequest(request);
};

const createForProduct = async (
  userId: string,
  entityId: string,
  changes: ProductUpdateInput
) => {
  await assertNoPendingForEntity("PRODUCT", entityId);
  const previousState = await validateProductUpdate(entityId, changes);

  const request = await prisma.change_requests.create({
    data: {
      user_id: userId,
      entity_type: "PRODUCT",
      entity_id: entityId,
      changes,
      previous_state: previousState,
      status: "PENDING",
    },
    select: {
      id: true,
      entity_type: true,
      entity_id: true,
      changes: true,
      previous_state: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      reviewed_at: true,
      users: { select: { id: true, username: true } },
      reviewer: { select: { id: true, username: true } },
    },
  });

  return enrichRequest(request);
};

const listMine = async (userId: string, query: ListMyChangeRequestsQuery) => {
  const where = {
    user_id: userId,
    ...(query.entity_type ? { entity_type: query.entity_type } : {}),
    ...(query.entity_id ? { entity_id: query.entity_id } : {}),
  };

  const requests = await prisma.change_requests.findMany({
    where,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      entity_type: true,
      entity_id: true,
      changes: true,
      previous_state: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      reviewed_at: true,
      users: { select: { id: true, username: true } },
      reviewer: { select: { id: true, username: true } },
    },
  });

  return {
    requests: await Promise.all(requests.map((request) => enrichRequest(request))),
  };
};

const list = async (query: ListChangeRequestsQuery) => {
  const { page, limit, status } = query;
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [requests, total] = await Promise.all([
    prisma.change_requests.findMany({
      where,
      orderBy: { created_at: "asc" },
      skip,
      take: limit,
      select: {
        id: true,
        entity_type: true,
        entity_id: true,
        changes: true,
        previous_state: true,
        status: true,
        rejection_reason: true,
        created_at: true,
        reviewed_at: true,
        users: { select: { id: true, username: true } },
        reviewer: { select: { id: true, username: true } },
      },
    }),
    prisma.change_requests.count({ where }),
  ]);

  return {
    data: await Promise.all(requests.map((request) => enrichRequest(request))),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

async function applyApprovedChange(
  entityType: change_entity_type,
  entityId: string,
  changes: StoredChangePayload
) {
  if (entityType === "NODE") {
    await nodesService.applyNodeUpdate(entityId, changes as NodeUpdateInput);
    return;
  }

  await productsService.applyProductUpdate(
    entityId,
    changes as ProductUpdateInput
  );
}

const review = async (
  requestId: string,
  reviewerId: string,
  input: UpdateChangeRequestInput
) => {
  const request = await prisma.change_requests.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      status: true,
      entity_type: true,
      entity_id: true,
      changes: true,
    },
  });

  if (!request) {
    throw new NotFoundError("Solicitação não encontrada");
  }

  if (request.status !== "PENDING") {
    throw new BadRequestError("Solicitação já foi finalizada");
  }

  const reviewedAt = new Date();

  if (input.status === "APPROVED") {
    await applyApprovedChange(
      request.entity_type,
      request.entity_id,
      request.changes as StoredChangePayload
    );

    await prisma.change_requests.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewer_id: reviewerId,
        reviewed_at: reviewedAt,
      },
    });
  } else {
    const rejectionReason = assertValidRejectionReason(input.rejection_reason);

    await prisma.change_requests.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reviewer_id: reviewerId,
        reviewed_at: reviewedAt,
        rejection_reason: rejectionReason,
      },
    });
  }

  const updated = await prisma.change_requests.findUniqueOrThrow({
    where: { id: requestId },
    select: {
      id: true,
      entity_type: true,
      entity_id: true,
      changes: true,
      previous_state: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      reviewed_at: true,
      users: { select: { id: true, username: true } },
      reviewer: { select: { id: true, username: true } },
    },
  });

  return enrichRequest(updated);
};

export const changeRequestsService = {
  createForNode,
  createForProduct,
  listMine,
  list,
  review,
};
