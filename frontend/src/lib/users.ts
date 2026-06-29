import { apiClient } from "@/lib/api";
import type {
  UserInterest,
  UserInteractionsResponse,
  UserProfile,
} from "@/lib/types/users";

export const USER_INTERACTIONS_PAGE_LIMIT = 20;
export const MAX_USER_INTERESTS = 30;

type UserInterestsResponse = {
  data: UserInterest[];
};

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

export function fetchMyInterests(): Promise<UserInterest[]> {
  return apiClient<UserInterestsResponse>("/users/me/interests").then(
    (response) => response.data
  );
}

export function replaceMyInterests(nodeIds: string[]): Promise<UserInterest[]> {
  return apiClient<UserInterestsResponse>("/users/me/interests", {
    method: "PUT",
    body: JSON.stringify({ node_ids: nodeIds }),
  }).then((response) => response.data);
}
