import type { EvidencePreview, ThreadPreviewItem } from "@/lib/types/evidence";
import type { EvidenceRef } from "@/lib/types/chats";
import type { OpinionListItem, OpinionReply } from "@/lib/types/products";

export type ParsedHighlight = {
  type: "opinion" | "thread";
  id: string;
} | null;

export function parseHighlightParam(value: string | null): ParsedHighlight {
  if (!value) return null;

  const match = value.match(/^(opinion|thread):([0-9a-f-]{36})$/i);
  if (!match) return null;

  return {
    type: match[1] as "opinion" | "thread",
    id: match[2],
  };
}

function buildRepliesFromPreview(
  threadItems: ThreadPreviewItem[],
  parentId: string
): OpinionReply[] {
  return threadItems
    .filter((item) => item.kind === "thread" && item.parent_id === parentId)
    .map((item) => ({
      id: item.id,
      content: item.content,
      created_at: item.created_at,
      author: item.author,
      cached_upvotes: 0,
      user_vote: null,
      reports_locked: false,
      replies: buildRepliesFromPreview(threadItems, item.id),
    }));
}

export function previewToOpinionListItem(
  preview: EvidencePreview
): OpinionListItem {
  const root = preview.root_opinion;

  return {
    id: root.id,
    title: root.title,
    content: root.content,
    created_at: root.created_at,
    author: root.author,
    cached_upvotes: 0,
    user_vote: null,
    score: 0,
    reports_locked: false,
    replies: buildRepliesFromPreview(preview.thread_items, root.id),
  };
}

export function containsThread(
  replies: OpinionReply[],
  threadId: string
): boolean {
  for (const reply of replies) {
    if (reply.id === threadId) return true;
    if (containsThread(reply.replies, threadId)) return true;
  }

  return false;
}

export function opinionContainsHighlight(
  opinions: OpinionListItem[],
  highlight: ParsedHighlight
): boolean {
  if (!highlight) return false;

  if (highlight.type === "opinion") {
    return opinions.some((opinion) => opinion.id === highlight.id);
  }

  return opinions.some((opinion) =>
    containsThread(opinion.replies, highlight.id)
  );
}

export function getAncestorThreadIds(preview: EvidencePreview): string[] {
  if (preview.ref.source_type === "opinion") {
    return [];
  }

  const highlightId = preview.highlight_id;
  const ancestors: string[] = [];

  for (const item of preview.thread_items) {
    if (item.kind !== "thread") continue;
    if (item.id === highlightId) break;
    ancestors.push(item.id);
  }

  return ancestors;
}

export function highlightToEvidenceRef(
  highlight: ParsedHighlight
): EvidenceRef | null {
  if (!highlight) return null;

  return {
    source_type: highlight.type,
    source_id: highlight.id,
  };
}
