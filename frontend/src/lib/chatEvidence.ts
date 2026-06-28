import type { EvidenceRef, MentionedTechnicalFact } from "@/lib/types/chats";

export function countEvidenceByType(evidence: EvidenceRef[]): {
  opinions: number;
  threads: number;
} {
  return evidence.reduce(
    (acc, item) => {
      if (item.source_type === "opinion") acc.opinions += 1;
      else acc.threads += 1;
      return acc;
    },
    { opinions: 0, threads: 0 }
  );
}

export function formatEvidenceCount(evidence: EvidenceRef[]): string {
  const { opinions, threads } = countEvidenceByType(evidence);
  const parts: string[] = [];

  if (opinions > 0) {
    parts.push(opinions === 1 ? "1 opinião" : `${opinions} opiniões`);
  }

  if (threads > 0) {
    parts.push(threads === 1 ? "1 comentário" : `${threads} comentários`);
  }

  return parts.join(", ");
}

export function hasMessageSources(message: {
  mentioned_technical_facts: MentionedTechnicalFact[] | null;
  mentioned_evidences: EvidenceRef[] | null;
}): boolean {
  return (
    (message.mentioned_technical_facts?.length ?? 0) > 0 ||
    (message.mentioned_evidences?.length ?? 0) > 0
  );
}
