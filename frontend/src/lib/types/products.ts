import type { FeedNodeType, FeedPagination } from "@/lib/types/feed";
import type { ImageUploadResponse } from "@/lib/types/uploads";

export interface CreateProductPayload {
  name: string;
  nodeIds: string[];
  image_url?: string;
}

export type ProductImageUploadResponse = ImageUploadResponse;

export interface CreateProductResponse {
  id: string;
  name: string;
  ean: string | null;
  brand_name: string | null;
  image_url: string | null;
  created_at: string;
  nodeIds: string[];
}

export interface ProductNodeRef {
  id: string;
  name: string;
}

export interface ProductTaxonomy {
  tipo: ProductNodeRef | null;
  categoria: ProductNodeRef | null;
  marca: ProductNodeRef | null;
  tecnologias: ProductNodeRef[];
  composicoes: ProductNodeRef[];
  atributos: ProductNodeRef[];
}

export interface ProductDiscussionTabProduct {
  scope: "product";
  label: string;
  opinionCount: number;
}

export interface ProductDiscussionTabNode {
  scope: "node";
  nodeId: string;
  type: FeedNodeType;
  label: string;
  opinionCount: number;
}

export type ProductDiscussionTab =
  | ProductDiscussionTabProduct
  | ProductDiscussionTabNode;

export interface ProductDetailResponse {
  id: string;
  name: string;
  ean: string | null;
  brand_name: string | null;
  image_url: string | null;
  created_at: string;
  taxonomy: ProductTaxonomy;
  discussionTabs: ProductDiscussionTab[];
}

export interface OpinionAuthor {
  id: string;
  username: string;
}

export type UserVote = 1 | -1 | null;

export type ReactionAction = "like" | "dislike" | "remove_like" | "remove_dislike";

export interface ReactionResponse {
  cached_upvotes: number;
  user_vote: UserVote;
}

export interface OpinionReply {
  id: string;
  content: string;
  created_at: string;
  author: OpinionAuthor;
  cached_upvotes: number;
  user_vote: UserVote;
  replies: OpinionReply[];
}

export type ReplyTarget = {
  opinionId: string;
  parentInteractionId?: string;
} | null;

export interface OpinionListItem {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  author: OpinionAuthor;
  cached_upvotes: number;
  user_vote: UserVote;
  score: number;
  replies: OpinionReply[];
}

export interface ProductOpinionsResponse {
  data: OpinionListItem[];
  pagination: FeedPagination;
}

export interface CreateOpinionPayload {
  content: string;
}

export interface CreateOpinionResponse {
  id: string;
  user_id: string;
  product_id: string | null;
  node_id: string | null;
  title: string | null;
  content: string;
  status: string | null;
  created_at: string;
}

export interface CreateOpinionThreadResponse {
  id: string;
  opinion_id: string | null;
  parent_interaction_id: string | null;
  user_id: string;
  content: string;
  cached_upvotes: number | null;
  status: string | null;
  created_at: string;
}
