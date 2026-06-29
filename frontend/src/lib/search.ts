import { apiClient } from "@/lib/api";
import type {
  FacetSearchParams,
  FacetSearchResponse,
  ProductFacetsParams,
  ProductFacetsResponse,
  ProductSearchParams,
  ProductSearchResponse,
} from "@/lib/types/search";

export const PRODUCT_SEARCH_PAGE_LIMIT = 20;
export const FACET_PAGE_LIMIT = 15;

function buildScopeParams(
  params: ProductFacetsParams | ProductSearchParams
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.categoria_id) {
    query.categoria_id = params.categoria_id;
  } else if (params.tipo_id) {
    query.tipo_id = params.tipo_id;
  }

  return query;
}

export function fetchProductFacets(
  params: ProductFacetsParams
): Promise<ProductFacetsResponse> {
  return apiClient<ProductFacetsResponse>("/products/facets", {
    params: buildScopeParams(params),
  });
}

export function fetchFacetSearch(
  params: FacetSearchParams
): Promise<FacetSearchResponse> {
  const query = buildScopeParams(params);
  query.facet_type = params.facet_type;

  if (params.q?.trim()) {
    query.q = params.q.trim();
  }

  if (params.page) {
    query.page = String(params.page);
  }

  query.limit = String(params.limit ?? FACET_PAGE_LIMIT);

  return apiClient<FacetSearchResponse>("/products/facets", { params: query });
}

export function fetchProductSearch(
  params: ProductSearchParams
): Promise<ProductSearchResponse> {
  const query = buildScopeParams(params);

  if (params.node_ids && params.node_ids.length > 0) {
    query.node_ids = params.node_ids.join(",");
  }

  if (params.q?.trim()) {
    query.q = params.q.trim();
  }

  if (params.page) {
    query.page = String(params.page);
  }

  query.limit = String(params.limit ?? PRODUCT_SEARCH_PAGE_LIMIT);

  return apiClient<ProductSearchResponse>("/products/search", { params: query });
}
