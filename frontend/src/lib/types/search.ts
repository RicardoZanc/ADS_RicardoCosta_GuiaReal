import type { FeedPagination } from "@/lib/types/feed";

import type { NodesListResponse } from "@/lib/types/nodes";

export type FacetType = "TECNOLOGIA" | "COMPOSICAO" | "ATRIBUTO";

export interface FacetNode {
  id: string;
  name: string;
  productCount: number;
}

export interface ProductFacetsResponse {
  tecnologias: FacetNode[];
  composicoes: FacetNode[];
  atributos: FacetNode[];
}

export interface FacetSearchParams {
  tipo_id?: string;
  categoria_id?: string;
  facet_type: FacetType;
  q?: string;
  page?: number;
  limit?: number;
}

export interface FacetSearchResponse {
  data: FacetNode[];
  pagination: FeedPagination;
}

export interface SelectedFacetMeta {
  id: string;
  name: string;
  type: FacetType;
}

export interface ProductSearchNodeRef {
  id: string;
  name: string;
}

export interface ProductSearchItem {
  id: string;
  name: string;
  brand_name: string | null;
  image_url: string | null;
  created_at: string;
  categoria: ProductSearchNodeRef | null;
  marca: ProductSearchNodeRef | null;
}

export interface ProductSearchResponse {
  data: ProductSearchItem[];
  pagination: FeedPagination;
}

export interface ProductSearchParams {
  tipo_id?: string;
  categoria_id?: string;
  node_ids?: string[];
  q?: string;
  page?: number;
  limit?: number;
}

export interface ProductFacetsParams {
  tipo_id?: string;
  categoria_id?: string;
}

export interface GlobalSearchResponse {
  nodes: NodesListResponse;
  products: ProductSearchResponse;
}
