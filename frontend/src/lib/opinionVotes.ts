import type {
  OpinionListItem,
  OpinionReply,
  ReactionResponse,
  UserVote,
} from "@/lib/types/products";

function sumThreadCachedUpvotes(replies: OpinionReply[]): number {
  return replies.reduce(
    (sum, reply) =>
      sum + reply.cached_upvotes + sumThreadCachedUpvotes(reply.replies),
    0
  );
}

export function calcOpinionScore(opinion: OpinionListItem): number {
  return opinion.cached_upvotes + sumThreadCachedUpvotes(opinion.replies);
}

function patchThreadInReplies(
  replies: OpinionReply[],
  threadId: string,
  reaction: ReactionResponse
): OpinionReply[] {
  let changed = false;

  const next = replies.map((reply) => {
    if (reply.id === threadId) {
      changed = true;
      return {
        ...reply,
        cached_upvotes: reaction.cached_upvotes,
        user_vote: reaction.user_vote,
      };
    }

    const childReplies = patchThreadInReplies(reply.replies, threadId, reaction);
    if (childReplies !== reply.replies) {
      changed = true;
      return { ...reply, replies: childReplies };
    }

    return reply;
  });

  return changed ? next : replies;
}

export function patchThreadVote(
  opinions: OpinionListItem[],
  threadId: string,
  reaction: ReactionResponse
): OpinionListItem[] {
  return opinions.map((opinion) => {
    const nextReplies = patchThreadInReplies(opinion.replies, threadId, reaction);
    if (nextReplies === opinion.replies) {
      return opinion;
    }

    const updated = { ...opinion, replies: nextReplies };
    return { ...updated, score: calcOpinionScore(updated) };
  });
}

export function patchOpinionVote(
  opinions: OpinionListItem[],
  opinionId: string,
  reaction: ReactionResponse
): OpinionListItem[] {
  return opinions.map((opinion) => {
    if (opinion.id !== opinionId) {
      return opinion;
    }

    const updated: OpinionListItem = {
      ...opinion,
      cached_upvotes: reaction.cached_upvotes,
      user_vote: reaction.user_vote as UserVote,
    };

    return { ...updated, score: calcOpinionScore(updated) };
  });
}
