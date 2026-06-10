export interface CreateProductPayload {
  name: string;
  nodeIds: string[];
}

export interface CreateProductResponse {
  id: string;
  name: string;
  ean: string | null;
  brand_name: string | null;
  image_url: string | null;
  created_at: string;
  nodeIds: string[];
}
