"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { UserProfileView } from "@/components/profile/UserProfileView";
import { useUserProfileController } from "./controller";

function ProfileSkeleton() {
  return (
    <div className="skeleton-shimmer h-96 rounded-2xl border border-border/15" />
  );
}

export default function UserProfilePage() {
  const {
    profile,
    interactions,
    avatarPreviewUrl,
    notFound,
    isOwnProfile,
    isLoadingProfile,
    isLoadingInteractions,
    isLoadingMoreInteractions,
    hasMoreInteractions,
    isUploadingAvatar,
    loadMoreInteractions,
    handleSelectAvatar,
    handleRemoveAvatar,
  } = useUserProfileController();

  if (isLoadingProfile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <ProfileSkeleton />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PageHeader
          eyebrow="Perfil"
          title="Usuário não encontrado"
          description="O perfil que você procura não existe ou foi removido."
        />
        <Button asChild variant="outline" className="mt-8">
          <Link href="/feed">Voltar ao feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/feed">← Voltar ao feed</Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="Perfil"
        title={`@${profile.username}`}
        className="lg:mb-10"
      />

      <UserProfileView
        profile={profile}
        interactions={interactions}
        avatarPreviewUrl={avatarPreviewUrl}
        isOwnProfile={isOwnProfile}
        isUploadingAvatar={isUploadingAvatar}
        onSelectAvatar={isOwnProfile ? handleSelectAvatar : undefined}
        onRemoveAvatar={isOwnProfile ? handleRemoveAvatar : undefined}
      />

      {!isLoadingInteractions && hasMoreInteractions && (
        <div className="mt-8 flex justify-center lg:mt-10">
          <Button
            type="button"
            variant="outline"
            disabled={isLoadingMoreInteractions}
            onClick={loadMoreInteractions}
          >
            {isLoadingMoreInteractions ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}

      {isLoadingInteractions && (
        <div className="skeleton-shimmer mt-8 h-24 rounded-xl border border-border/15 lg:mt-10" />
      )}
    </div>
  );
}
