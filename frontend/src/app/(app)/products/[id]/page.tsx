"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { DiscussionTabBar } from "@/components/product-detail/DiscussionTabBar";
import { OpinionComposer } from "@/components/product-detail/OpinionComposer";
import { OpinionList } from "@/components/product-detail/OpinionList";
import { ProductTaxonomyPanel } from "@/components/product-detail/ProductTaxonomyPanel";
import { EntityEditButton } from "@/components/entity-detail/EntityEditButton";
import { useProductDetailController } from "./controller";

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-10 lg:gap-12">
      <div className="grid gap-6 rounded-2xl border border-border/15 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:p-8">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="skeleton-shimmer h-20 rounded-xl" />
          <div className="skeleton-shimmer h-40 rounded-xl" />
        </div>
        <div className="skeleton-shimmer order-1 aspect-square rounded-2xl lg:order-2 lg:aspect-[4/5] lg:min-h-[22rem]" />
      </div>
      <div className="skeleton-shimmer h-96 rounded-2xl border border-border/15" />
    </div>
  );
}

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
    expandedThreadIds,
  } = useProductDetailController();

  if (isLoadingProduct) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <DetailSkeleton />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <PageHeader
          eyebrow="Produto"
          title="Produto não encontrado"
          description="O produto que você procura não existe ou foi removido."
        />
        <Button asChild variant="outline" className="mt-8">
          <Link href="/feed">Voltar ao feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/feed">← Voltar ao feed</Link>
        </Button>
        <EntityEditButton href={`/products/${product.id}/edit`} />
      </div>

      <div className="flex flex-col gap-10 lg:gap-12">
        <FadeIn>
          <ProductTaxonomyPanel product={product} />
        </FadeIn>

        <FadeIn>
          <section className="space-y-6">
            <SectionHeader
              eyebrow="Comentários"
              title="Discussão da comunidade"
            />

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
                    className="skeleton-shimmer h-32 rounded-xl border border-border/15"
                    aria-hidden
                  />
                ))}
              </div>
            ) : (
              <>
                <OpinionList
                  opinions={opinions}
                  expandedThreadIds={expandedThreadIds}
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
        </FadeIn>
      </div>
    </div>
  );
}
