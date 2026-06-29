import { apiClient } from "@/lib/api";
import type { FeedResponse, SimplifiedFeedResponse } from "@/lib/types/feed";

export const FEED_PAGE_LIMIT = 20;
export const SIMPLIFIED_FEED_SECTION_LIMIT = 8;

export function fetchFeedPage(
  page: number,
  limit = FEED_PAGE_LIMIT
): Promise<FeedResponse> {
  return apiClient<FeedResponse>("/feed", {
    params: { page: String(page), limit: String(limit) },
  });
}

export function fetchSimplifiedFeed(
  limit = SIMPLIFIED_FEED_SECTION_LIMIT
): Promise<SimplifiedFeedResponse> {
  return apiClient<SimplifiedFeedResponse>("/feed", {
    params: {
      simplified: "true",
      limit: String(limit),
    },
  });
}
