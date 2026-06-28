"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserProfileView } from "@/components/profile/UserProfileView";
import { useUserProfileController } from "./controller";

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
        <div className="h-96 animate-pulse rounded-xl border border-border/30 bg-muted/20" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
          Perfil
        </p>
        <h1 className="mt-2 font-sans text-h2 font-bold text-foreground">
          Usuário não encontrado
        </h1>
        <p className="mt-4 text-body text-muted">
          O perfil que você procura não existe ou foi removido.
        </p>
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

      <header className="mb-8 space-y-2 lg:mb-10">
        <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
          Perfil
        </p>
        <h1 className="font-sans text-h2 font-bold tracking-tight text-foreground">
          @{profile.username}
        </h1>
      </header>

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
        <div className="mt-8 h-24 animate-pulse rounded-xl border border-border/30 bg-muted/20 lg:mt-10" />
      )}
    </div>
  );
}
