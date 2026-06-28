export const WEIGHT_UPVOTES = 1.5;
export const WEIGHT_REPUTATION = 0.5;
export function calculateEvidenceWeight(thread) {
    if (thread.status === "PROCESSED" || thread.user.is_banned) {
        return 0;
    }
    const upvotes = thread.cached_upvotes ?? 0;
    const reputation = thread.user.reputation_score ?? 0;
    const score = upvotes * WEIGHT_UPVOTES + reputation * WEIGHT_REPUTATION;
    return score < 0 ? 0 : score;
}
