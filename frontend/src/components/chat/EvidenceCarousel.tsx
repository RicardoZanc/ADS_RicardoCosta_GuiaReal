"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvidencePreviewCard } from "@/components/chat/EvidencePreviewCard";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { easeOut } from "@/lib/motion";
import type { EvidencePreview } from "@/lib/types/evidence";
import { cn } from "@/lib/utils";

interface EvidenceCarouselProps {
  items: EvidencePreview[];
  factLabel?: string;
}

const SLIDE_OFFSET = 48;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? SLIDE_OFFSET : -SLIDE_OFFSET,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -SLIDE_OFFSET : SLIDE_OFFSET,
    opacity: 0,
  }),
};

const reducedSlideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export function EvidenceCarousel({ items, factLabel }: EvidenceCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const showControls = items.length > 1;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < items.length - 1;

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((index) => Math.max(0, index - 1));
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((index) => Math.min(items.length - 1, index + 1));
  }, [items.length]);

  useEffect(() => {
    setActiveIndex(0);
    setDirection(0);
  }, [items]);

  useEffect(() => {
    if (!showControls) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showControls, goPrev, goNext]);

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border/15 bg-card px-6 py-10 text-center text-comment text-muted shadow-[var(--shadow-card)]">
        Nenhuma fonte disponível para exibir.
      </p>
    );
  }

  const preview = items[activeIndex];
  const previewKey = `${preview.ref.source_type}-${preview.ref.source_id}`;

  return (
    <div className="flex w-full items-center justify-center gap-3 sm:gap-5">
      <div className="flex w-10 shrink-0 items-center justify-center sm:w-11">
        {showControls ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Fonte anterior"
            disabled={!canGoPrev}
            onClick={goPrev}
            className={cn(
              "size-10 rounded-full border-border/30 bg-card/95 shadow-md backdrop-blur-sm",
              "hover:bg-card disabled:opacity-30"
            )}
          >
            <ChevronLeft className="size-5" />
          </Button>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        {showControls ? (
          <p className="mb-3 text-center text-small text-muted-foreground">
            {activeIndex + 1} de {items.length}
          </p>
        ) : null}

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={previewKey}
              custom={direction}
              variants={prefersReducedMotion ? reducedSlideVariants : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={prefersReducedMotion ? { duration: 0.01 } : easeOut}
            >
              <EvidencePreviewCard preview={preview} factLabel={factLabel} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex w-10 shrink-0 items-center justify-center sm:w-11">
        {showControls ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Próxima fonte"
            disabled={!canGoNext}
            onClick={goNext}
            className={cn(
              "size-10 rounded-full border-border/30 bg-card/95 shadow-md backdrop-blur-sm",
              "hover:bg-card disabled:opacity-30"
            )}
          >
            <ChevronRight className="size-5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
