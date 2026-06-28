export const WEIGHT_UPVOTES = 1.5;
export const WEIGHT_REPUTATION = 0.5;
export function calculateEvidenceWeight(item) {
    if (item.status === "PROCESSED" || item.user.is_banned) {
        return 0;
    }
    const upvotes = item.cached_upvotes ?? 0;
    const reputation = item.user.reputation_score ?? 0;
    const score = upvotes * WEIGHT_UPVOTES + reputation * WEIGHT_REPUTATION;
    return score < 0 ? 0 : score;
}
export function evidenceRefKey(sourceType, sourceId) {
    return `${sourceType}:${sourceId}`;
}
