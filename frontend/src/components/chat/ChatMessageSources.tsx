"use client";

import { formatEvidenceCount } from "@/lib/chatEvidence";
import { Tag } from "@/components/ui/tag";
import type { EvidenceRef, MentionedTechnicalFact } from "@/lib/types/chats";

interface ChatMessageSourcesProps {
  facts: MentionedTechnicalFact[];
  evidences: EvidenceRef[] | null;
}

export function ChatMessageSources({ facts, evidences }: ChatMessageSourcesProps) {
  if (facts.length === 0 && (evidences?.length ?? 0) === 0) return null;

  return (
    <div className="mt-3 border-t border-border/15 pt-3">
      <p className="text-small font-medium text-muted">
        Com base na comunidade
      </p>
      {facts.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {facts.map((fact) => (
            <li
              key={fact.id}
              className="rounded-lg bg-muted/10 px-3 py-2 ring-1 ring-border/15"
            >
              <p className="text-small text-foreground">{fact.fact_label}</p>
              <p className="mt-1">
                <Tag>{formatEvidenceCount(fact.evidence)}</Tag>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        evidences && (
          <p className="mt-2 text-small text-muted">
            {formatEvidenceCount(evidences)}
          </p>
        )
      )}
    </div>
  );
}
