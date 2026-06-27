export const REPUTATION_UPVOTE_RECEIVED = 2;
export const REPUTATION_DOWNVOTE_RECEIVED = -1;

type UserVote = 1 | -1 | null;

function reputationScoreForVote(vote: UserVote): number {
  if (vote === 1) return REPUTATION_UPVOTE_RECEIVED;
  if (vote === -1) return REPUTATION_DOWNVOTE_RECEIVED;
  return 0;
}

export function isSelfVote(
  voterUserId: string,
  contentOwnerUserId: string
): boolean {
  return voterUserId === contentOwnerUserId;
}

export function shouldApplyReputationFromVote(
  voterUserId: string,
  contentOwnerUserId: string
): boolean {
  return !isSelfVote(voterUserId, contentOwnerUserId);
}

export function calculateReputationDeltaFromVoteTransition(
  previousVote: UserVote,
  nextVote: UserVote
): number {
  return reputationScoreForVote(nextVote) - reputationScoreForVote(previousVote);
}
