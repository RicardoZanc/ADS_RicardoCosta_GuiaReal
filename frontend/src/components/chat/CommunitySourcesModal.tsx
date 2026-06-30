"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EvidenceCarousel } from "@/components/chat/EvidenceCarousel";
import { fetchEvidencePreview } from "@/lib/evidence";
import type { EvidenceRef } from "@/lib/types/chats";
import type { EvidencePreview } from "@/lib/types/evidence";

interface CommunitySourcesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence: EvidenceRef[];
  factLabel?: string;
}

export function CommunitySourcesModal({
  open,
  onOpenChange,
  evidence,
  factLabel,
}: CommunitySourcesModalProps) {
  const [previews, setPreviews] = useState<EvidencePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || evidence.length === 0) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchEvidencePreview(evidence);
        if (!cancelled) {
          setPreviews(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as fontes"
          );
          setPreviews([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, evidence]);

  useEffect(() => {
    if (!open) {
      setPreviews([]);
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-1/2 max-h-[calc(100vh-2rem)] max-w-4xl -translate-y-1/2 gap-0 overflow-hidden border-border/15 p-0">
        <DialogHeader className="space-y-3 px-6 pb-2 pt-6">
          <Eyebrow size="sm">Comunidade</Eyebrow>
          <DialogTitle className="text-h4">Fontes da resposta</DialogTitle>
          <DialogDescription className="text-comment">
            {factLabel
              ? `Opiniões e comentários que sustentam: ${factLabel}`
              : "Trechos da discussão usados como referência nesta resposta."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-6 pt-2 sm:px-6">
          {isLoading ? (
            <div className="space-y-3 py-6">
              <div className="skeleton-shimmer h-40 rounded-xl" />
              <p className="text-center text-comment text-muted">
                Carregando fontes...
              </p>
            </div>
          ) : error ? (
            <p className="py-10 text-center text-comment text-destructive">
              {error}
            </p>
          ) : (
            <EvidenceCarousel items={previews} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
