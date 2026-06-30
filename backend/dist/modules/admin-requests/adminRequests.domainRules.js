import { prisma } from "../../lib/prisma";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, } from "../../lib/errors/BaseError";
export const MIN_REPUTATION_FOR_ADMIN_REQUEST = 50;
export const ADMIN_REQUEST_COOLDOWN_DAYS = 180;
export const MIN_ADMIN_REQUEST_MESSAGE_LENGTH = 50;
export const MAX_ADMIN_REQUEST_MESSAGE_LENGTH = 2000;
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function toIsoString(date) {
    return (date ?? new Date(0)).toISOString();
}
export function assertValidAdminRequestMessage(message) {
    const trimmed = message.trim();
    if (trimmed.length < MIN_ADMIN_REQUEST_MESSAGE_LENGTH) {
        throw new BadRequestError(`A motivação deve ter pelo menos ${MIN_ADMIN_REQUEST_MESSAGE_LENGTH} caracteres`);
    }
    if (trimmed.length > MAX_ADMIN_REQUEST_MESSAGE_LENGTH) {
        throw new BadRequestError(`A motivação deve ter no máximo ${MAX_ADMIN_REQUEST_MESSAGE_LENGTH} caracteres`);
    }
    return trimmed;
}
export async function loadUserForAdminRequest(userId) {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            is_admin: true,
            is_banned: true,
            reputation_score: true,
        },
    });
    if (!user) {
        throw new NotFoundError("Usuário não encontrado");
    }
    return user;
}
export async function computeAdminRequestEligibility(user) {
    const min_reputation = MIN_REPUTATION_FOR_ADMIN_REQUEST;
    if (user.is_admin) {
        return { can_request: false, reason: "ALREADY_ADMIN", min_reputation };
    }
    if (user.is_banned) {
        return { can_request: false, reason: "BANNED", min_reputation };
    }
    const reputation = user.reputation_score ?? 0;
    if (reputation < MIN_REPUTATION_FOR_ADMIN_REQUEST) {
        return { can_request: false, reason: "LOW_REPUTATION", min_reputation };
    }
    const pending = await prisma.admin_requests.findFirst({
        where: { user_id: user.id, status: "PENDING" },
        select: { id: true },
    });
    if (pending) {
        return { can_request: false, reason: "PENDING_REQUEST", min_reputation };
    }
    const lastRejected = await prisma.admin_requests.findFirst({
        where: { user_id: user.id, status: "REJECTED" },
        orderBy: { reviewed_at: "desc" },
        select: { reviewed_at: true },
    });
    if (lastRejected?.reviewed_at) {
        const cooldownEnds = addDays(lastRejected.reviewed_at, ADMIN_REQUEST_COOLDOWN_DAYS);
        if (cooldownEnds > new Date()) {
            return {
                can_request: false,
                reason: "COOLDOWN",
                cooldown_ends_at: toIsoString(cooldownEnds),
                min_reputation,
            };
        }
    }
    return { can_request: true, min_reputation };
}
export async function assertCanCreateAdminRequest(userId, message) {
    const trimmedMessage = assertValidAdminRequestMessage(message);
    const user = await loadUserForAdminRequest(userId);
    const eligibility = await computeAdminRequestEligibility(user);
    if (!eligibility.can_request) {
        switch (eligibility.reason) {
            case "ALREADY_ADMIN":
                throw new ConflictError("Você já é administrador");
            case "BANNED":
                throw new ForbiddenError("Usuários banidos não podem solicitar admin");
            case "LOW_REPUTATION":
                throw new BadRequestError(`Reputação mínima de ${MIN_REPUTATION_FOR_ADMIN_REQUEST} pontos é necessária`);
            case "PENDING_REQUEST":
                throw new ConflictError("Você já possui uma solicitação pendente");
            case "COOLDOWN":
                throw new ConflictError(`Aguarde até ${eligibility.cooldown_ends_at} para solicitar novamente`);
            default:
                throw new BadRequestError("Não é possível criar solicitação no momento");
        }
    }
    return trimmedMessage;
}
export function assertValidRejectionReason(rejectionReason) {
    if (!rejectionReason?.trim()) {
        throw new BadRequestError("Informe o motivo da rejeição em rejection_reason");
    }
    const trimmed = rejectionReason.trim();
    if (trimmed.length > MAX_ADMIN_REQUEST_MESSAGE_LENGTH) {
        throw new BadRequestError(`O motivo da rejeição deve ter no máximo ${MAX_ADMIN_REQUEST_MESSAGE_LENGTH} caracteres`);
    }
    return trimmed;
}
