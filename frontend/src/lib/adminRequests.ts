import { apiClient } from "@/lib/api";
import type {
  AdminRequestItem,
  AdminRequestStatus,
  AdminRequestsListResponse,
  CreateAdminRequestPayload,
  MyAdminRequestsResponse,
  UpdateAdminRequestPayload,
} from "@/lib/types/adminRequests";

export function fetchMyAdminRequests(): Promise<MyAdminRequestsResponse> {
  return apiClient<MyAdminRequestsResponse>("/admin-requests/me");
}

export function createAdminRequest(
  payload: CreateAdminRequestPayload
): Promise<AdminRequestItem> {
  return apiClient<AdminRequestItem>("/admin-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminRequests(params?: {
  status?: AdminRequestStatus;
  page?: number;
  limit?: number;
}): Promise<AdminRequestsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `/admin-requests?${query}` : "/admin-requests";

  return apiClient<AdminRequestsListResponse>(endpoint);
}

export function updateAdminRequest(
  id: string,
  payload: UpdateAdminRequestPayload
): Promise<AdminRequestItem> {
  return apiClient<AdminRequestItem>(`/admin-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
