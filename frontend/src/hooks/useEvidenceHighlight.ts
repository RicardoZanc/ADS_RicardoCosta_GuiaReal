"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchEvidencePreview } from "@/lib/evidence";
import {
  getAncestorThreadIds,
  highlightToEvidenceRef,
  opinionContainsHighlight,
  parseHighlightParam,
  previewToOpinionListItem,
  type ParsedHighlight,
} from "@/lib/evidenceHighlight";
import type { OpinionListItem } from "@/lib/types/products";

const HIGHLIGHT_DURATION_MS = 3000;

interface UseEvidenceHighlightOptions {
  opinions: OpinionListItem[];
  setOpinions: React.Dispatch<React.SetStateAction<OpinionListItem[]>>;
  isLoadingOpinions: boolean;
}

function scrollToHighlight(highlight: ParsedHighlight) {
  if (!highlight) return false;

  const elementId =
    highlight.type === "opinion"
      ? `opinion-${highlight.id}`
      : `thread-${highlight.id}`;

  const element = document.getElementById(elementId);
  if (!element) return false;

  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add("evidence-highlight");

  window.setTimeout(() => {
    element.classList.remove("evidence-highlight");
  }, HIGHLIGHT_DURATION_MS);

  return true;
}

export function useEvidenceHighlight({
  opinions,
  setOpinions,
  isLoadingOpinions,
}: UseEvidenceHighlightOptions) {
  const searchParams = useSearchParams();
  const highlight = parseHighlightParam(searchParams.get("highlight"));
  const [expandedThreadIds, setExpandedThreadIds] = useState<string[]>([]);
  const injectedHighlightRef = useRef<string | null>(null);
  const scrolledHighlightRef = useRef<string | null>(null);
  const ancestorsLoadedRef = useRef<string | null>(null);

  const highlightKey = highlight ? `${highlight.type}:${highlight.id}` : null;

  useEffect(() => {
    if (!highlight || !highlightKey || isLoadingOpinions) return;
    if (opinionContainsHighlight(opinions, highlight)) return;
    if (injectedHighlightRef.current === highlightKey) return;

    const evidenceRef = highlightToEvidenceRef(highlight);
    if (!evidenceRef) return;

    let cancelled = false;

    void fetchEvidencePreview([evidenceRef]).then((response) => {
      if (cancelled) return;

      const preview = response.data[0];
      if (!preview) return;

      setExpandedThreadIds(getAncestorThreadIds(preview));
      ancestorsLoadedRef.current = highlightKey;

      const injected = previewToOpinionListItem(preview);
      setOpinions((prev) => [
        injected,
        ...prev.filter((opinion) => opinion.id !== injected.id),
      ]);
      injectedHighlightRef.current = highlightKey;
    });

    return () => {
      cancelled = true;
    };
  }, [highlight, highlightKey, isLoadingOpinions, opinions, setOpinions]);

  useEffect(() => {
    if (!highlight || !highlightKey || isLoadingOpinions) return;
    if (highlight.type !== "thread") return;
    if (ancestorsLoadedRef.current === highlightKey) return;

    const evidenceRef = highlightToEvidenceRef(highlight);
    if (!evidenceRef) return;

    let cancelled = false;

    void fetchEvidencePreview([evidenceRef]).then((response) => {
      if (cancelled) return;

      const preview = response.data[0];
      if (!preview) return;

      setExpandedThreadIds(getAncestorThreadIds(preview));
      ancestorsLoadedRef.current = highlightKey;
    });

    return () => {
      cancelled = true;
    };
  }, [highlight, highlightKey, isLoadingOpinions]);

  useEffect(() => {
    if (!highlight || !highlightKey || isLoadingOpinions) return;
    if (!opinionContainsHighlight(opinions, highlight)) return;
    if (scrolledHighlightRef.current === highlightKey) return;

    const timer = window.setTimeout(() => {
      if (scrollToHighlight(highlight)) {
        scrolledHighlightRef.current = highlightKey;
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [highlight, highlightKey, isLoadingOpinions, opinions]);

  return { highlight, expandedThreadIds };
}
