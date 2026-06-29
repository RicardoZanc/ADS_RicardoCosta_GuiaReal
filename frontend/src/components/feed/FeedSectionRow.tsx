"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FeedProductCard } from "@/components/feed/FeedProductCard";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { FeedItem } from "@/lib/types/feed";
import { cn } from "@/lib/utils";

interface FeedSectionRowProps {
  title: string;
  items: FeedItem[];
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
}

const CARD_GAP_PX = 20;

function getScrollStep(container: HTMLDivElement): number {
  const firstItem = container.querySelector<HTMLElement>("[data-carousel-item]");
  if (firstItem) {
    return firstItem.offsetWidth + CARD_GAP_PX;
  }
  return 404;
}

export function FeedSectionRow({
  title,
  items,
  emptyMessage = "Nenhum item no momento.",
  emptyAction,
}: FeedSectionRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScrollLeft = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < maxScrollLeft - 4);
  }, []);

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

  const showControls = canScrollLeft || canScrollRight;

  return (
    <section className="space-y-4">
      <Eyebrow>{title}</Eyebrow>

      {items.length === 0 ? (
        <div className="space-y-2">
          <p className="text-body text-muted">{emptyMessage}</p>
          {emptyAction && (
            <Link
              href={emptyAction.href}
              className="text-body font-medium text-accent hover:text-accent/80"
            >
              {emptyAction.label}
            </Link>
          )}
        </div>
      ) : (
        <div className="-mx-2 flex items-center gap-2 sm:-mx-3 sm:gap-3">
          <div className="flex w-10 shrink-0 items-center justify-center sm:w-11">
            {showControls && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Ver itens anteriores"
                disabled={!canScrollLeft}
                onClick={() => scroll(-1)}
                className="rounded-full border-border/40 bg-card shadow-sm"
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
          </div>

          <div className="relative rounded-2xl min-w-0 flex-1 overflow-hidden">
            {canScrollLeft && (
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background via-background/80 to-transparent sm:w-24"
                aria-hidden
              />
            )}
            {canScrollRight && (
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background via-background/80 to-transparent sm:w-24"
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
              {items.map((item) => (
                <div
                  key={`${item.kind}-${item.id}`}
                  data-carousel-item
                  className="w-[24rem] shrink-0 sm:w-[26rem]"
                >
                  <FeedProductCard item={item} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-10 shrink-0 items-center justify-center sm:w-11">
            {showControls && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Ver próximos itens"
                disabled={!canScrollRight}
                onClick={() => scroll(1)}
                className="rounded-full border-border/40 bg-card shadow-sm"
              >
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
