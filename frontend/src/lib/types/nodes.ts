export type NodeType =
  | "TIPO"
  | "CATEGORIA"
  | "MARCA"
  | "TECNOLOGIA"
  | "COMPOSICAO"
  | "ATRIBUTO";

export type ViewableNodeType =
  | "CATEGORIA"
  | "MARCA"
  | "TECNOLOGIA"
  | "COMPOSICAO"
  | "ATRIBUTO";

export interface NodeContext {
  parentTipo: { id: string; name: string } | null;
}

export interface NodeDetailResponse {
  id: string;
  name: string;
  type: ViewableNodeType;
  wikidata_id: string | null;
  image_url: string | null;
  created_at: string;
  context: NodeContext;
  opinionCount: number;
}

export interface NodeRecord {
  id: string;
  name: string;
  type: NodeType;
  parent_id: string | null;
  wikidata_id: string | null;
  image_url: string | null;
  created_at: string | null;
}

export interface NodesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NodesListResponse {
  data: NodeRecord[];
  pagination: NodesPagination;
}

export interface SelectedNode {
  id: string;
  name: string;
  type: NodeType;
}
