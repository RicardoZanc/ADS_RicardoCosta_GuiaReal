"use client";

import { FeedSectionRow } from "@/components/feed/FeedSectionRow";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/store/authStore";
import { useFeedController } from "./controller";

function FeedSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton-shimmer h-4 w-48 rounded" />
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="skeleton-shimmer h-52 w-[24rem] shrink-0 rounded-xl border border-border/15 sm:w-[26rem]"
          />
        ))}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { feed, isLoading } = useFeedController();
  const username = useAuthStore((state) => state.user?.username);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Feed"
        title="Descubra o que importa"
        description="Discussões da comunidade, recomendações dos seus interesses e novidades em um só lugar."
        className="mb-10 lg:mb-12"
      />

      {isLoading ? (
        <div className="flex flex-col gap-10">
          <FeedSectionSkeleton />
          <FeedSectionSkeleton />
          <FeedSectionSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-10 lg:gap-12">
          <FeedSectionRow
            title="Do que a comunidade está falando"
            items={feed.community}
            emptyMessage="Nenhuma discussão recente."
          />

          <FeedSectionRow
            title="Dos seus interesses"
            items={feed.interests}
            emptyMessage="Configure seus interesses para ver recomendações."
            emptyAction={
              username
                ? {
                    label: "Editar interesses no perfil",
                    href: `/users/${encodeURIComponent(username)}`,
                  }
                : undefined
            }
          />

          <FeedSectionRow
            title="Novos"
            items={feed.new}
            emptyMessage="Nenhum item novo."
          />
        </div>
      )}
    </div>
  );
}
