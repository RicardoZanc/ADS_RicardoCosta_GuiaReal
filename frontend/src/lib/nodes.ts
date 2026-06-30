import { apiClient } from "@/lib/api";
import { patchEntity } from "@/lib/patchEntity";
import type { NodeDetailResponse, NodeRecord } from "@/lib/types/nodes";
import type { ProductOpinionsResponse } from "@/lib/types/products";

export type UpdateNodePayload = {
  name?: string;
  image_url?: string | null;
};

export const NODE_OPINIONS_PAGE_LIMIT = 20;

export type FetchNodeOpinionsParams = {
  page?: number;
  limit?: number;
};

export function fetchNodeDetail(id: string): Promise<NodeDetailResponse> {
  return apiClient<NodeDetailResponse>(`/nodes/${id}`);
}

export function fetchNodeOpinions(
  id: string,
  {
    page = 1,
    limit = NODE_OPINIONS_PAGE_LIMIT,
  }: FetchNodeOpinionsParams = {}
): Promise<ProductOpinionsResponse> {
  return apiClient<ProductOpinionsResponse>(`/nodes/${id}/opinions`, {
    params: {
      page: String(page),
      limit: String(limit),
    },
  });
}

export function updateNode(id: string, body: UpdateNodePayload) {
  return patchEntity<NodeRecord>(`/nodes/${id}`, { body });
}
