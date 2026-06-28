export const REPUTATION_UPVOTE_RECEIVED = 2;
export const REPUTATION_DOWNVOTE_RECEIVED = -1;
function reputationScoreForVote(vote) {
    if (vote === 1)
        return REPUTATION_UPVOTE_RECEIVED;
    if (vote === -1)
        return REPUTATION_DOWNVOTE_RECEIVED;
    return 0;
}
export function isSelfVote(voterUserId, contentOwnerUserId) {
    return voterUserId === contentOwnerUserId;
}
export function shouldApplyReputationFromVote(voterUserId, contentOwnerUserId) {
    return !isSelfVote(voterUserId, contentOwnerUserId);
}
export function calculateReputationDeltaFromVoteTransition(previousVote, nextVote) {
    return reputationScoreForVote(nextVote) - reputationScoreForVote(previousVote);
}
