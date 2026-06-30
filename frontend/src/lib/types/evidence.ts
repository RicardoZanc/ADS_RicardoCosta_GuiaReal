import type { EvidenceRef } from "@/lib/types/chats";

export type EvidenceAuthor = {
  id: string;
  username: string;
  avatar_url: string | null;
  is_admin: boolean;
};

export type ThreadPreviewItem = {
  id: string;
  kind: "opinion" | "thread";
  parent_id: string | null;
  content: string;
  author: EvidenceAuthor;
  created_at: string;
  depth: number;
  is_evidence: boolean;
};

export type EvidenceContext = {
  type: "product" | "node";
  product_id: string | null;
  node_id: string | null;
  title: string;
  tab_label: string | null;
};

export type RootOpinionPreview = {
  id: string;
  title: string | null;
  content: string;
  author: EvidenceAuthor;
  created_at: string;
};

export type EvidencePreview = {
  ref: EvidenceRef;
  context: EvidenceContext;
  root_opinion: RootOpinionPreview;
  thread_items: ThreadPreviewItem[];
  highlight_id: string;
  discussion_path: string;
};

export interface EvidencePreviewResponse {
  data: EvidencePreview[];
}
