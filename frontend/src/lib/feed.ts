import { apiClient } from "@/lib/api";
import type { FeedResponse } from "@/lib/types/feed";

export const FEED_PAGE_LIMIT = 20;

export function fetchFeedPage(
  page: number,
  limit = FEED_PAGE_LIMIT
): Promise<FeedResponse> {
  return apiClient<FeedResponse>("/feed", {
    params: { page: String(page), limit: String(limit) },
  });
}
