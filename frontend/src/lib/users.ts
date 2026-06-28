import { apiClient } from "@/lib/api";
import type {
  UserInteractionsResponse,
  UserProfile,
} from "@/lib/types/users";

export const USER_INTERACTIONS_PAGE_LIMIT = 20;

export function fetchUserProfile(username: string): Promise<UserProfile> {
  return apiClient<UserProfile>(`/users/${encodeURIComponent(username)}`);
}

export function fetchUserInteractions(
  username: string,
  page: number,
  limit = USER_INTERACTIONS_PAGE_LIMIT
): Promise<UserInteractionsResponse> {
  return apiClient<UserInteractionsResponse>(
    `/users/${encodeURIComponent(username)}/interactions`,
    {
      params: { page: String(page), limit: String(limit) },
    }
  );
}

export function updateUserAvatar(avatarUrl: string | null): Promise<UserProfile> {
  return apiClient<UserProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });
}
