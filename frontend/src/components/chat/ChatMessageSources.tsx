"use client";

import { formatEvidenceCount } from "@/lib/chatEvidence";
import type { EvidenceRef, MentionedTechnicalFact } from "@/lib/types/chats";

interface ChatMessageSourcesProps {
  facts: MentionedTechnicalFact[];
  evidences: EvidenceRef[] | null;
}

export function ChatMessageSources({ facts, evidences }: ChatMessageSourcesProps) {
  if (facts.length === 0 && (evidences?.length ?? 0) === 0) return null;

  return (
    <div className="mt-3 border-t border-border/30 pt-3">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">
        Com base na comunidade
      </p>
      {facts.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {facts.map((fact) => (
            <li
              key={fact.id}
              className="rounded-lg bg-muted/20 px-3 py-2 ring-1 ring-border/20"
            >
              <p className="text-small text-foreground">{fact.fact_label}</p>
              <p className="mt-1 font-mono text-xs text-muted">
                {formatEvidenceCount(fact.evidence)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        evidences && (
          <p className="mt-2 font-mono text-xs text-muted">
            {formatEvidenceCount(evidences)}
          </p>
        )
      )}
    </div>
  );
}
