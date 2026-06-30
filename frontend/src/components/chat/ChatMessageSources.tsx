"use client";

import { useState } from "react";
import { formatEvidenceCount } from "@/lib/chatEvidence";
import { Tag } from "@/components/ui/tag";
import { CommunitySourcesModal } from "@/components/chat/CommunitySourcesModal";
import type { EvidenceRef, MentionedTechnicalFact } from "@/lib/types/chats";
import { cn } from "@/lib/utils";

interface ChatMessageSourcesProps {
  facts: MentionedTechnicalFact[];
  evidences: EvidenceRef[] | null;
}

export function ChatMessageSources({ facts, evidences }: ChatMessageSourcesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRef[]>([]);
  const [selectedFactLabel, setSelectedFactLabel] = useState<string | undefined>();

  if (facts.length === 0 && (evidences?.length ?? 0) === 0) return null;

  function openModal(evidence: EvidenceRef[], factLabel?: string) {
    setSelectedEvidence(evidence);
    setSelectedFactLabel(factLabel);
    setModalOpen(true);
  }

  return (
    <>
      <div className="mt-3 border-t border-border/15 pt-3">
        <p className="text-small font-medium text-muted">
          Com base na comunidade
        </p>
        {facts.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {facts.map((fact) => (
              <li key={fact.id}>
                <button
                  type="button"
                  onClick={() => openModal(fact.evidence, fact.fact_label)}
                  className={cn(
                    "w-full rounded-lg bg-muted/5 px-3 py-2.5 text-left",
                    "cursor-pointer transition-colors hover:bg-muted/10"
                  )}
                >
                  <p className="text-small text-foreground">{fact.fact_label}</p>
                  <p className="mt-1">
                    <Tag className="pointer-events-none">
                      {formatEvidenceCount(fact.evidence)}
                    </Tag>
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          evidences && (
            <button
              type="button"
              onClick={() => openModal(evidences)}
              className={cn(
                "mt-2 rounded-lg bg-muted/5 px-2 py-1 text-small text-muted",
                "cursor-pointer transition-colors hover:bg-muted/10 hover:text-foreground"
              )}
            >
              {formatEvidenceCount(evidences)}
            </button>
          )
        )}
      </div>

      <CommunitySourcesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        evidence={selectedEvidence}
        factLabel={selectedFactLabel}
      />
    </>
  );
}
