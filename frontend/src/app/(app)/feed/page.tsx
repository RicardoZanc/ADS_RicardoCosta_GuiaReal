"use client";

import { FeedProductCard } from "@/components/feed/FeedProductCard";
import { Button } from "@/components/ui/button";
import { useFeedController } from "./controller";

export default function FeedPage() {
  const { items, isLoading, isLoadingMore, hasMore, loadMore } =
    useFeedController();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 space-y-2">
        <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
          Feed
        </p>
        <h1 className="font-sans text-h2 font-bold tracking-tight text-foreground">
          O que a comunidade está discutindo
        </h1>
        <p className="max-w-2xl text-body text-muted">
          Produtos e tópicos com debates recentes. Clique em um card para ver
          mais detalhes e participar da conversa.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1].map((key) => (
            <div
              key={key}
              className="h-72 animate-pulse rounded-xl border border-border/30 bg-muted/20"
              aria-hidden
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-body text-muted">
          Nenhum item no feed no momento.
        </p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item) => (
              <FeedProductCard key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>

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
