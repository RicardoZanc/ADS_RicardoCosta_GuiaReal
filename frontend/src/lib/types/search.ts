import type { FeedPagination } from "@/lib/types/feed";

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
