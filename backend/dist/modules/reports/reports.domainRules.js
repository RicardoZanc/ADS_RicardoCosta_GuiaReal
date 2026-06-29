import { prisma } from "../../lib/prisma";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, } from "../../lib/errors/BaseError";
export const REPORT_REASONS = [
    "SPAM",
    "OFFENSIVE",
    "MISLEADING",
    "OFF_TOPIC",
    "OTHER",
];
export function assertValidReportReason(reason) {
    if (!REPORT_REASONS.includes(reason)) {
        throw new BadRequestError(`Motivo inválido. Valores aceitos: ${REPORT_REASONS.join(", ")}`);
    }
    return reason;
}
export async function loadReportTarget(targetType, targetId) {
    if (targetType === "opinion") {
        const opinion = await prisma.opinions.findUnique({
            where: { id: targetId },
            select: {
                id: true,
                user_id: true,
                is_hidden: true,
                reports_locked: true,
            },
        });
        if (!opinion) {
            throw new NotFoundError("Opinião não encontrada");
        }
        return {
            targetType,
            targetId: opinion.id,
            authorId: opinion.user_id,
            isHidden: opinion.is_hidden,
            reportsLocked: opinion.reports_locked,
        };
    }
    const thread = await prisma.discussion_threads.findUnique({
        where: { id: targetId },
        select: {
            id: true,
            user_id: true,
            is_hidden: true,
            reports_locked: true,
        },
    });
    if (!thread) {
        throw new NotFoundError("Comentário não encontrado");
    }
    return {
        targetType,
        targetId: thread.id,
        authorId: thread.user_id,
        isHidden: thread.is_hidden,
        reportsLocked: thread.reports_locked,
    };
}
export function assertCanReport(reporterId, target) {
    if (target.isHidden) {
        throw new NotFoundError("Conteúdo não encontrado");
    }
    if (target.reportsLocked) {
        throw new ConflictError("Este conteúdo não pode mais ser denunciado");
    }
    if (target.authorId === reporterId) {
        throw new ForbiddenError("Você não pode denunciar o próprio conteúdo");
    }
}
export async function assertNoExistingReport(reporterId, targetType, targetId) {
    const existing = await prisma.reports.findFirst({
        where: {
            reporter_id: reporterId,
            ...(targetType === "opinion"
                ? { target_opinion_id: targetId }
                : { target_interaction_id: targetId }),
        },
        select: { id: true },
    });
    if (existing) {
        throw new ConflictError("Você já denunciou este conteúdo");
    }
}
