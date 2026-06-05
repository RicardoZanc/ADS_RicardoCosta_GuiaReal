export type FeedNodeType =
  | "CATEGORIA"
  | "MARCA"
  | "TECNOLOGIA"
  | "COMPOSICAO"
  | "ATRIBUTO";

export interface FeedNode {
  id: string;
  name: string;
  type: FeedNodeType;
}

export interface FeedDiscussionAuthor {
  id: string;
  username: string;
}

export interface FeedDiscussionPreview {
  id: string;
  content: string;
  created_at: string;
  author: FeedDiscussionAuthor;
}

export interface FeedProduct {
  id: string;
  name: string;
  brand_name: string | null;
  image_url: string | null;
  created_at: string;
  nodes: FeedNode[];
  discussionPreviews: FeedDiscussionPreview[];
}

export interface FeedPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeedResponse {
  data: FeedProduct[];
  pagination: FeedPagination;
}
