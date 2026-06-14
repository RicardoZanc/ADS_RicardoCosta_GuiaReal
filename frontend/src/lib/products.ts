import { apiClient } from "@/lib/api";
import type {
  CreateOpinionPayload,
  CreateOpinionResponse,
  CreateOpinionThreadResponse,
  ProductDetailResponse,
  ProductOpinionsResponse,
} from "@/lib/types/products";

export const PRODUCT_OPINIONS_PAGE_LIMIT = 20;

export type FetchProductOpinionsParams = {
  scope: "product" | "node";
  nodeId?: string;
  page?: number;
  limit?: number;
};

export function fetchProductDetail(id: string): Promise<ProductDetailResponse> {
  return apiClient<ProductDetailResponse>(`/products/${id}`);
}

export function fetchProductOpinions(
  id: string,
  {
    scope,
    nodeId,
    page = 1,
    limit = PRODUCT_OPINIONS_PAGE_LIMIT,
  }: FetchProductOpinionsParams
): Promise<ProductOpinionsResponse> {
  const params: Record<string, string> = {
    scope,
    page: String(page),
    limit: String(limit),
  };

  if (scope === "node" && nodeId) {
    params.node_id = nodeId;
  }

  return apiClient<ProductOpinionsResponse>(`/products/${id}/opinions`, {
    params,
  });
}

export function createProductOpinion(
  productId: string,
  body: CreateOpinionPayload
): Promise<CreateOpinionResponse> {
  return apiClient<CreateOpinionResponse>(`/opinions/products/${productId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function createNodeOpinion(
  nodeId: string,
  body: CreateOpinionPayload
): Promise<CreateOpinionResponse> {
  return apiClient<CreateOpinionResponse>(`/opinions/nodes/${nodeId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function createOpinionThread(
  opinionId: string,
  content: string
): Promise<CreateOpinionThreadResponse> {
  return apiClient<CreateOpinionThreadResponse>(
    `/opinions/${opinionId}/threads`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );
}
