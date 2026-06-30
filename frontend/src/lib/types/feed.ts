export type FeedNodeType =
  | "CATEGORIA"
  | "MARCA"
  | "TECNOLOGIA"
  | "COMPOSICAO"
  | "ATRIBUTO";

export type FeedItemKind = "product" | "node";

export interface FeedNode {
  id: string;
  name: string;
  type: FeedNodeType;
}

export interface FeedDiscussionAuthor {
  id: string;
  username: string;
  is_admin: boolean;
}

export interface FeedDiscussionPreview {
  id: string;
  content: string;
  created_at: string;
  author: FeedDiscussionAuthor;
}

export interface FeedItem {
  kind: FeedItemKind;
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
  data: FeedItem[];
  pagination: FeedPagination;
}

export type SimplifiedFeedResponse = {
  community: FeedItem[];
  interests: FeedItem[];
  new: FeedItem[];
};
