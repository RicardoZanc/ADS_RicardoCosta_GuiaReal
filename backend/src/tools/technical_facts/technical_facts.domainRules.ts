import type { queue_status } from "../../generated/prisma/enums";

export const WEIGHT_UPVOTES = 1.5;
export const WEIGHT_REPUTATION = 0.5;

export type ThreadEvaluationInput = {
  cached_upvotes: number | null;
  status: queue_status | null;
  user: {
    reputation_score: number | null;
    is_banned: boolean | null;
  };
};

export function calculateEvidenceWeight(thread: ThreadEvaluationInput): number {
  if (thread.status === "PROCESSED" || thread.user.is_banned) {
    return 0;
  }

  const upvotes = thread.cached_upvotes ?? 0;
  const reputation = thread.user.reputation_score ?? 0;
  const score = upvotes * WEIGHT_UPVOTES + reputation * WEIGHT_REPUTATION;

  return score < 0 ? 0 : score;
}
