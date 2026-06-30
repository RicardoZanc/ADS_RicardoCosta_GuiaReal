import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../lib/errors/BaseError";
import {
  assertCanCreateAdminRequest,
  assertValidRejectionReason,
  computeAdminRequestEligibility,
  loadUserForAdminRequest,
} from "./adminRequests.domainRules";
import type {
  CreateAdminRequestInput,
  ListAdminRequestsQuery,
  UpdateAdminRequestInput,
} from "./adminRequests.schema";

function toIsoString(date: Date | null | undefined): string {
  return (date ?? new Date(0)).toISOString();
}

function mapAdminRequestItem(request: {
  id: string;
  message: string;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  reviewed_at: Date | null;
  users: {
    id: string;
    username: string;
    reputation_score: number | null;
  };
  reviewer: { id: string; username: string } | null;
}) {
  return {
    id: request.id,
    message: request.message,
    status: request.status,
    rejection_reason: request.rejection_reason,
    created_at: toIsoString(request.created_at),
    reviewed_at: request.reviewed_at ? toIsoString(request.reviewed_at) : null,
    user: {
      id: request.users.id,
      username: request.users.username,
      reputation_score: request.users.reputation_score ?? 0,
    },
    reviewer: request.reviewer,
  };
}

const create = async (userId: string, input: CreateAdminRequestInput) => {
  const message = await assertCanCreateAdminRequest(userId, input.message);

  const request = await prisma.admin_requests.create({
    data: {
      user_id: userId,
      message,
      status: "PENDING",
    },
    select: {
      id: true,
      message: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      reviewed_at: true,
      users: {
        select: { id: true, username: true, reputation_score: true },
      },
      reviewer: {
        select: { id: true, username: true },
      },
    },
  });

  return mapAdminRequestItem(request);
};

const listMine = async (userId: string) => {
  const user = await loadUserForAdminRequest(userId);

  const [requests, eligibility] = await Promise.all([
    prisma.admin_requests.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        message: true,
        status: true,
        rejection_reason: true,
        created_at: true,
        reviewed_at: true,
        users: {
          select: { id: true, username: true, reputation_score: true },
        },
        reviewer: {
          select: { id: true, username: true },
        },
      },
    }),
    computeAdminRequestEligibility(user),
  ]);

  return {
    requests: requests.map(mapAdminRequestItem),
    eligibility,
  };
};

const list = async (query: ListAdminRequestsQuery) => {
  const { page, limit, status } = query;
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [requests, total] = await Promise.all([
    prisma.admin_requests.findMany({
      where,
      orderBy: { created_at: "asc" },
      skip,
      take: limit,
      select: {
        id: true,
        message: true,
        status: true,
        rejection_reason: true,
        created_at: true,
        reviewed_at: true,
        users: {
          select: { id: true, username: true, reputation_score: true },
        },
        reviewer: {
          select: { id: true, username: true },
        },
      },
    }),
    prisma.admin_requests.count({ where }),
  ]);

  return {
    data: requests.map(mapAdminRequestItem),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const update = async (
  requestId: string,
  reviewerId: string,
  input: UpdateAdminRequestInput
) => {
  const request = await prisma.admin_requests.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      status: true,
      user_id: true,
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
    await prisma.$transaction([
      prisma.admin_requests.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          reviewer_id: reviewerId,
          reviewed_at: reviewedAt,
        },
      }),
      prisma.users.update({
        where: { id: request.user_id },
        data: { is_admin: true },
      }),
    ]);
  } else {
    const rejectionReason = assertValidRejectionReason(input.rejection_reason);

    await prisma.admin_requests.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reviewer_id: reviewerId,
        reviewed_at: reviewedAt,
        rejection_reason: rejectionReason,
      },
    });
  }

  const updated = await prisma.admin_requests.findUniqueOrThrow({
    where: { id: requestId },
    select: {
      id: true,
      message: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      reviewed_at: true,
      users: {
        select: { id: true, username: true, reputation_score: true },
      },
      reviewer: {
        select: { id: true, username: true },
      },
    },
  });

  return mapAdminRequestItem(updated);
};

export const adminRequestsService = {
  create,
  listMine,
  list,
  update,
};
