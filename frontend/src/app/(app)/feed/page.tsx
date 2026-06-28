"use client";

import { FeedProductCard } from "@/components/feed/FeedProductCard";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useFeedController } from "./controller";

function FeedSkeleton() {
  return (
    <div className="columns-1 gap-6 md:columns-2">
      {[0, 1, 2].map((key) => (
        <div key={key} className="mb-6 break-inside-avoid">
          <div
            className="skeleton-shimmer h-48 rounded-xl border border-border/15"
            aria-hidden
          />
        </div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const { items, isLoading, isLoadingMore, hasMore, loadMore } =
    useFeedController();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Feed"
        title="O que a comunidade está discutindo"
        description="Produtos e tópicos com debates recentes. Clique em um card para ver mais detalhes e participar da conversa."
      />

      {isLoading ? (
        <FeedSkeleton />
      ) : items.length === 0 ? (
        <p className="text-body text-muted">
          Nenhum item no feed no momento.
        </p>
      ) : (
        <>
          <StaggerList
            key={items.length}
            className="columns-1 gap-6 md:columns-2"
          >
            {items.map((item) => (
              <StaggerItem
                key={`${item.kind}-${item.id}`}
                className="mb-6 break-inside-avoid"
              >
                <FeedProductCard item={item} />
              </StaggerItem>
            ))}
          </StaggerList>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                loading={isLoadingMore}
                onClick={loadMore}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
