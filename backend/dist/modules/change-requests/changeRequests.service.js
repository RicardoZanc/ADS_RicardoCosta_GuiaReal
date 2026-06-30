import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError, } from "../../lib/errors/BaseError";
import { validateNodeUpdate, } from "../nodes/nodes.domainRules";
import { validateProductUpdate, } from "../products/products.domainRules";
import { nodesService } from "../nodes/nodes.service";
import { productsService } from "../products/products.service";
import { assertNoPendingForEntity, assertValidRejectionReason, buildNodeDiff, buildNodeEntityLabel, buildProductDiff, buildProductEntityLabel, buildProposedNodeState, buildProposedProductState, } from "./changeRequests.domainRules";
function toIsoString(date) {
    return (date ?? new Date(0)).toISOString();
}
function mapChangeRequestItem(request) {
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
async function enrichRequest(request) {
    let entity_label;
    let diff;
    if (request.entity_type === "NODE") {
        entity_label = await buildNodeEntityLabel(request.entity_id);
        const proposed = await buildProposedNodeState(request.previous_state, request.changes);
        diff = buildNodeDiff(request.previous_state, proposed);
    }
    else {
        entity_label = await buildProductEntityLabel(request.entity_id);
        const proposed = await buildProposedProductState(request.previous_state, request.changes);
        diff = buildProductDiff(request.previous_state, proposed);
    }
    return mapChangeRequestItem({
        ...request,
        entity_label,
        diff,
    });
}
const createForNode = async (userId, entityId, changes) => {
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
const createForProduct = async (userId, entityId, changes) => {
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
const listMine = async (userId, query) => {
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
const list = async (query) => {
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
async function applyApprovedChange(entityType, entityId, changes) {
    if (entityType === "NODE") {
        await nodesService.applyNodeUpdate(entityId, changes);
        return;
    }
    await productsService.applyProductUpdate(entityId, changes);
}
const review = async (requestId, reviewerId, input) => {
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
        await applyApprovedChange(request.entity_type, request.entity_id, request.changes);
        await prisma.change_requests.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                reviewer_id: reviewerId,
                reviewed_at: reviewedAt,
            },
        });
    }
    else {
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
