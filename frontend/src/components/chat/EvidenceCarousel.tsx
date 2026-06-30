"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvidencePreviewCard } from "@/components/chat/EvidencePreviewCard";
import type { EvidencePreview } from "@/lib/types/evidence";
import { cn } from "@/lib/utils";

const CARD_GAP_PX = 20;

interface EvidenceCarouselProps {
  items: EvidencePreview[];
}

function getScrollStep(container: HTMLDivElement): number {
  const firstItem = container.querySelector<HTMLElement>("[data-carousel-item]");
  if (firstItem) {
    return firstItem.offsetWidth + CARD_GAP_PX;
  }
  return 380;
}

export function EvidenceCarousel({ items }: EvidenceCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScrollLeft = scrollWidth - clientWidth;
    const step = getScrollStep(container);
    const index = step > 0 ? Math.round(scrollLeft / step) : 0;

    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < maxScrollLeft - 4);
    setActiveIndex(Math.min(index, items.length - 1));
  }, [items.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || items.length === 0) return;

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(container);

    return () => observer.disconnect();
  }, [items.length, updateScrollState]);

  const scroll = (direction: -1 | 1) => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction * getScrollStep(container),
      behavior: "smooth",
    });
  };

  const showControls = items.length > 1;

  if (items.length === 0) {
    return (
      <p className="px-2 py-10 text-center text-comment text-muted">
        Nenhuma fonte disponível para exibir.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showControls ? (
        <p className="text-center text-small text-muted">
          {activeIndex + 1} de {items.length}
        </p>
      ) : null}

      <div className="-mx-1 flex items-center gap-2 sm:gap-3">
        <div className="flex w-10 shrink-0 items-center justify-center sm:w-11">
          {showControls ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Fonte anterior"
              disabled={!canScrollLeft}
              onClick={() => scroll(-1)}
              className="rounded-full border-border/40 bg-card shadow-sm"
            >
              <ChevronLeft className="size-4" />
            </Button>
          ) : null}
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl">
          {canScrollLeft && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-card via-card/80 to-transparent sm:w-16"
              aria-hidden
            />
          )}
          {canScrollRight && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-card via-card/80 to-transparent sm:w-16"
              aria-hidden
            />
          )}

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className={cn(
              "flex gap-5 overflow-x-auto scroll-smooth py-1",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            {items.map((preview) => (
              <div
                key={`${preview.ref.source_type}-${preview.ref.source_id}`}
                data-carousel-item
                className="w-[min(100%,22rem)] shrink-0 sm:w-[24rem]"
              >
                <div className="flex max-h-[min(70vh,32rem)] min-h-[18rem] flex-col">
                  <EvidencePreviewCard preview={preview} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-10 shrink-0 items-center justify-center sm:w-11">
          {showControls ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Próxima fonte"
              disabled={!canScrollRight}
              onClick={() => scroll(1)}
              className="rounded-full border-border/40 bg-card shadow-sm"
            >
              <ChevronRight className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
