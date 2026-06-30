import { apiClient } from "@/lib/api";
import type {
  ChangeRequestItem,
  ChangeRequestStatus,
  ChangeRequestsListResponse,
  MyChangeRequestsResponse,
  UpdateChangeRequestPayload,
} from "@/lib/types/changeRequests";
import type { ChangeEntityType } from "@/lib/types/changeRequests";

export function fetchMyChangeRequests(params?: {
  entity_type?: ChangeEntityType;
  entity_id?: string;
}): Promise<MyChangeRequestsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.entity_type) {
    searchParams.set("entity_type", params.entity_type);
  }
  if (params?.entity_id) {
    searchParams.set("entity_id", params.entity_id);
  }

  const query = searchParams.toString();
  const endpoint = query ? `/change-requests/me?${query}` : "/change-requests/me";

  return apiClient<MyChangeRequestsResponse>(endpoint);
}

export function fetchChangeRequests(params?: {
  status?: ChangeRequestStatus;
  page?: number;
  limit?: number;
}): Promise<ChangeRequestsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `/change-requests?${query}` : "/change-requests";

  return apiClient<ChangeRequestsListResponse>(endpoint);
}

export function updateChangeRequest(
  id: string,
  payload: UpdateChangeRequestPayload
): Promise<ChangeRequestItem> {
  return apiClient<ChangeRequestItem>(`/change-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
