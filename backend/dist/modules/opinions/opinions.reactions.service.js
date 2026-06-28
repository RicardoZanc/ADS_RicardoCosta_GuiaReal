import { prisma } from "../../lib/prisma";
import { calculateReputationDeltaFromVoteTransition, shouldApplyReputationFromVote, } from "../users/users.domainRules";
import { usersService } from "../users/users.service";
import { ensureOpinionExists, ensureThreadExists, } from "./opinions.domainRules";
function resolveVoteOperation(currentVote, action) {
    const current = currentVote ?? null;
    switch (action) {
        case "like":
            if (current === 1)
                return { kind: "delete" };
            return current === null
                ? { kind: "create", voteType: 1 }
                : { kind: "update", voteType: 1 };
        case "dislike":
            if (current === -1)
                return { kind: "delete" };
            return current === null
                ? { kind: "create", voteType: -1 }
                : { kind: "update", voteType: -1 };
        case "remove_like":
            return current === 1 ? { kind: "delete" } : { kind: "noop" };
        case "remove_dislike":
            return current === -1 ? { kind: "delete" } : { kind: "noop" };
    }
}
function toUserVote(voteType) {
    if (voteType === 1 || voteType === -1)
        return voteType;
    return null;
}
async function recalcOpinionCachedUpvotes(tx, opinionId) {
    const aggregate = await tx.reaction_votes.aggregate({
        where: { opinion_id: opinionId },
        _sum: { vote_type: true },
    });
    const cachedUpvotes = aggregate._sum.vote_type ?? 0;
    await tx.opinions.update({
        where: { id: opinionId },
        data: { cached_upvotes: cachedUpvotes },
    });
    return cachedUpvotes;
}
async function recalcThreadCachedUpvotes(tx, threadId) {
    const aggregate = await tx.reaction_votes.aggregate({
        where: { interaction_id: threadId },
        _sum: { vote_type: true },
    });
    const cachedUpvotes = aggregate._sum.vote_type ?? 0;
    await tx.discussion_threads.update({
        where: { id: threadId },
        data: { cached_upvotes: cachedUpvotes },
    });
    return cachedUpvotes;
}
async function applyVoteOperation(tx, userId, voteId, operation, target) {
    if (operation.kind === "noop") {
        const existing = voteId
            ? await tx.reaction_votes.findUnique({
                where: { id: voteId },
                select: { vote_type: true },
            })
            : null;
        return toUserVote(existing?.vote_type);
    }
    if (operation.kind === "delete") {
        if (voteId) {
            await tx.reaction_votes.delete({ where: { id: voteId } });
        }
        return null;
    }
    if (operation.kind === "create") {
        await tx.reaction_votes.create({
            data: {
                user_id: userId,
                vote_type: operation.voteType,
                ...("opinionId" in target
                    ? { opinion_id: target.opinionId }
                    : { interaction_id: target.threadId }),
            },
        });
        return operation.voteType;
    }
    if (voteId) {
        await tx.reaction_votes.update({
            where: { id: voteId },
            data: { vote_type: operation.voteType },
        });
    }
    return operation.voteType;
}
async function applyReputationForVoteChange(tx, voterUserId, contentOwnerUserId, previousVote, nextVote) {
    const delta = calculateReputationDeltaFromVoteTransition(previousVote, nextVote);
    if (delta !== 0 &&
        shouldApplyReputationFromVote(voterUserId, contentOwnerUserId)) {
        await usersService.applyReputationDelta(contentOwnerUserId, delta, tx);
    }
}
const reactToOpinion = async (opinionId, userId, action) => {
    await ensureOpinionExists(opinionId);
    return prisma.$transaction(async (tx) => {
        const [existingVote, opinion] = await Promise.all([
            tx.reaction_votes.findFirst({
                where: { user_id: userId, opinion_id: opinionId },
                select: { id: true, vote_type: true },
            }),
            tx.opinions.findUnique({
                where: { id: opinionId },
                select: { user_id: true },
            }),
        ]);
        const previousVote = toUserVote(existingVote?.vote_type);
        const operation = resolveVoteOperation(existingVote?.vote_type, action);
        const userVote = await applyVoteOperation(tx, userId, existingVote?.id, operation, { opinionId });
        await applyReputationForVoteChange(tx, userId, opinion.user_id, previousVote, userVote);
        const cachedUpvotes = await recalcOpinionCachedUpvotes(tx, opinionId);
        return { cached_upvotes: cachedUpvotes, user_vote: userVote };
    });
};
const reactToThread = async (threadId, userId, action) => {
    await ensureThreadExists(threadId);
    return prisma.$transaction(async (tx) => {
        const [existingVote, thread] = await Promise.all([
            tx.reaction_votes.findFirst({
                where: { user_id: userId, interaction_id: threadId },
                select: { id: true, vote_type: true },
            }),
            tx.discussion_threads.findUnique({
                where: { id: threadId },
                select: { user_id: true },
            }),
        ]);
        const previousVote = toUserVote(existingVote?.vote_type);
        const operation = resolveVoteOperation(existingVote?.vote_type, action);
        const userVote = await applyVoteOperation(tx, userId, existingVote?.id, operation, { threadId });
        await applyReputationForVoteChange(tx, userId, thread.user_id, previousVote, userVote);
        const cachedUpvotes = await recalcThreadCachedUpvotes(tx, threadId);
        return { cached_upvotes: cachedUpvotes, user_vote: userVote };
    });
};
export const opinionsReactionsService = {
    reactToOpinion,
    reactToThread,
};
