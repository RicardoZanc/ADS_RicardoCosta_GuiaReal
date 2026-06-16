"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DiscussionTabBar } from "@/components/product-detail/DiscussionTabBar";
import { OpinionComposer } from "@/components/product-detail/OpinionComposer";
import { OpinionList } from "@/components/product-detail/OpinionList";
import { ProductTaxonomyPanel } from "@/components/product-detail/ProductTaxonomyPanel";
import { useProductDetailController } from "./controller";

export default function ProductDetailPage() {
  const {
    product,
    notFound,
    activeTabIndex,
    opinions,
    isLoadingProduct,
    isLoadingOpinions,
    isLoadingMoreOpinions,
    hasMoreOpinions,
    isSubmittingOpinion,
    replyTarget,
    isSubmittingReply,
    votingTargetId,
    opinionRegister,
    opinionErrors,
    onSubmitOpinion,
    replyRegister,
    replyErrors,
    selectTab,
    loadMoreOpinions,
    startReply,
    cancelReply,
    onSubmitReply,
    onVoteOpinion,
    onDislikeOpinion,
    onVoteThread,
    onDislikeThread,
  } = useProductDetailController();

  if (isLoadingProduct) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">
          <div className="h-64 animate-pulse rounded-xl border border-border/30 bg-muted/20" />
          <div className="h-96 animate-pulse rounded-xl border border-border/30 bg-muted/20" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
          Produto
        </p>
        <h1 className="mt-2 font-sans text-h2 font-bold text-foreground">
          Produto não encontrado
        </h1>
        <p className="mt-4 text-body text-muted">
          O produto que você procura não existe ou foi removido.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/feed">Voltar ao feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/feed">← Voltar ao feed</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-10">
        <ProductTaxonomyPanel product={product} />

        <section className="space-y-6 border-t border-border/30 pt-10">
          <div className="space-y-2">
            <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
              Comentários
            </p>
            <h2 className="font-sans text-h3 font-bold text-foreground">
              Discussão da comunidade
            </h2>
          </div>

          <DiscussionTabBar
            tabs={product.discussionTabs}
            activeTabIndex={activeTabIndex}
            disabled={isLoadingOpinions || isSubmittingOpinion}
            onSelectTab={selectTab}
          />

          <OpinionComposer
            register={opinionRegister}
            errors={opinionErrors}
            isSubmitting={isSubmittingOpinion}
            onSubmit={onSubmitOpinion}
          />

          {isLoadingOpinions ? (
            <div className="space-y-4">
              {[0, 1].map((key) => (
                <div
                  key={key}
                  className="h-32 animate-pulse border border-border/30 bg-muted/20"
                  aria-hidden
                />
              ))}
            </div>
          ) : (
            <>
              <OpinionList
                opinions={opinions}
                replyTarget={replyTarget}
                isSubmittingReply={isSubmittingReply}
                votingTargetId={votingTargetId}
                replyRegister={replyRegister}
                replyErrors={replyErrors}
                onStartReply={startReply}
                onCancelReply={cancelReply}
                onSubmitReply={onSubmitReply}
                onVoteOpinion={onVoteOpinion}
                onDislikeOpinion={onDislikeOpinion}
                onVoteThread={onVoteThread}
                onDislikeThread={onDislikeThread}
              />

              {hasMoreOpinions && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    loading={isLoadingMoreOpinions}
                    onClick={loadMoreOpinions}
                  >
                    Carregar mais
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
