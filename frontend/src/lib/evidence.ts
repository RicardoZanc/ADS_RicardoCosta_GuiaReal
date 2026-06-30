import { apiClient } from "@/lib/api";
import type { EvidenceRef } from "@/lib/types/chats";
import type {
  EvidencePreview,
  EvidencePreviewResponse,
} from "@/lib/types/evidence";

export function fetchEvidencePreview(
  evidence: EvidenceRef[]
): Promise<EvidencePreviewResponse> {
  return apiClient<EvidencePreviewResponse>("/evidence/preview", {
    method: "POST",
    body: JSON.stringify({ evidence }),
  });
}

export function buildDiscussionUrl(preview: EvidencePreview): string {
  return preview.discussion_path;
}
