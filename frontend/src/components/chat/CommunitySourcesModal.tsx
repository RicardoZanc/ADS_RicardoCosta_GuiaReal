"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent
        className="top-1/2 max-h-[calc(100vh-2rem)] max-w-3xl -translate-y-1/2 border-none bg-transparent p-4 shadow-none sm:p-6"
        overlayClassName="bg-background/70 backdrop-blur-md"
      >
        <DialogTitle className="sr-only">Fontes da resposta</DialogTitle>
        <DialogDescription className="sr-only">
          {factLabel
            ? `Opiniões e comentários que sustentam: ${factLabel}`
            : "Trechos da discussão usados como referência nesta resposta."}
        </DialogDescription>

        {isLoading ? (
          <div className="mx-auto w-full max-w-xl space-y-3">
            <div className="skeleton-shimmer h-72 rounded-2xl shadow-[var(--shadow-card)]" />
            <p className="text-center text-comment text-muted-foreground">
              Carregando fontes...
            </p>
          </div>
        ) : error ? (
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/20 bg-card px-6 py-10 text-center shadow-[var(--shadow-card)]">
            <p className="text-comment text-destructive">{error}</p>
          </div>
        ) : (
          <EvidenceCarousel items={previews} factLabel={factLabel} />
        )}
      </DialogContent>
    </Dialog>
  );
}
