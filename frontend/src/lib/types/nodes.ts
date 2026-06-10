export type NodeType =
  | "TIPO"
  | "CATEGORIA"
  | "MARCA"
  | "TECNOLOGIA"
  | "COMPOSICAO"
  | "ATRIBUTO";

export interface NodeRecord {
  id: string;
  name: string;
  type: NodeType;
  parent_id: string | null;
  wikidata_id: string | null;
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
