import { prisma } from "../../lib/prisma";
import {
  ensureOpinionExists,
  ensureThreadExists,
} from "./opinions.domainRules";
import type { ReactionAction } from "./opinions.schema";

export type ReactionResult = {
  cached_upvotes: number;
  user_vote: 1 | -1 | null;
};

type VoteOperation =
  | { kind: "create"; voteType: 1 | -1 }
  | { kind: "update"; voteType: 1 | -1 }
  | { kind: "delete" }
  | { kind: "noop" };

type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

function resolveVoteOperation(
  currentVote: number | null | undefined,
  action: ReactionAction
): VoteOperation {
  const current = currentVote ?? null;

  switch (action) {
    case "like":
      if (current === 1) return { kind: "delete" };
      return current === null
        ? { kind: "create", voteType: 1 }
        : { kind: "update", voteType: 1 };
    case "dislike":
      if (current === -1) return { kind: "delete" };
      return current === null
        ? { kind: "create", voteType: -1 }
        : { kind: "update", voteType: -1 };
    case "remove_like":
      return current === 1 ? { kind: "delete" } : { kind: "noop" };
    case "remove_dislike":
      return current === -1 ? { kind: "delete" } : { kind: "noop" };
  }
}

function toUserVote(voteType: number | null | undefined): 1 | -1 | null {
  if (voteType === 1 || voteType === -1) return voteType;
  return null;
}

async function recalcOpinionCachedUpvotes(
  tx: TransactionClient,
  opinionId: string
): Promise<number> {
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

async function recalcThreadCachedUpvotes(
  tx: TransactionClient,
  threadId: string
): Promise<number> {
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

async function applyVoteOperation(
  tx: TransactionClient,
  userId: string,
  voteId: string | undefined,
  operation: VoteOperation,
  target: { opinionId: string } | { threadId: string }
): Promise<1 | -1 | null> {
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

const reactToOpinion = async (
  opinionId: string,
  userId: string,
  action: ReactionAction
): Promise<ReactionResult> => {
  await ensureOpinionExists(opinionId);

  return prisma.$transaction(async (tx) => {
    const existingVote = await tx.reaction_votes.findFirst({
      where: { user_id: userId, opinion_id: opinionId },
      select: { id: true, vote_type: true },
    });

    const operation = resolveVoteOperation(existingVote?.vote_type, action);
    const userVote = await applyVoteOperation(
      tx,
      userId,
      existingVote?.id,
      operation,
      { opinionId }
    );

    const cachedUpvotes = await recalcOpinionCachedUpvotes(tx, opinionId);

    return { cached_upvotes: cachedUpvotes, user_vote: userVote };
  });
};

const reactToThread = async (
  threadId: string,
  userId: string,
  action: ReactionAction
): Promise<ReactionResult> => {
  await ensureThreadExists(threadId);

  return prisma.$transaction(async (tx) => {
    const existingVote = await tx.reaction_votes.findFirst({
      where: { user_id: userId, interaction_id: threadId },
      select: { id: true, vote_type: true },
    });

    const operation = resolveVoteOperation(existingVote?.vote_type, action);
    const userVote = await applyVoteOperation(
      tx,
      userId,
      existingVote?.id,
      operation,
      { threadId }
    );

    const cachedUpvotes = await recalcThreadCachedUpvotes(tx, threadId);

    return { cached_upvotes: cachedUpvotes, user_vote: userVote };
  });
};

export const opinionsReactionsService = {
  reactToOpinion,
  reactToThread,
};
