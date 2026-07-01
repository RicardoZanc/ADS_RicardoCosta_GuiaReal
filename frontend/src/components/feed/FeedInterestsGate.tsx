"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FeedSectionRow } from "@/components/feed/FeedSectionRow";
import { useAuthGate } from "@/hooks/useAuthGate";
import type { FeedItem } from "@/lib/types/feed";

interface FeedInterestsGateProps {
  isAuthenticated: boolean;
  items: FeedItem[];
  username?: string;
}

function InterestsPlaceholder() {
  return (
    <div className="flex gap-5 overflow-hidden py-1">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="skeleton-shimmer h-52 w-[24rem] shrink-0 rounded-xl border border-border/15 sm:w-[26rem]"
        />
      ))}
    </div>
  );
}

interface InterestsGateOverlayProps {
  title: string;
  description: string;
  actions: React.ReactNode;
}

function InterestsGateOverlay({
  title,
  description,
  actions,
}: InterestsGateOverlayProps) {
  return (
    <section className="relative space-y-4">
      <Eyebrow>Dos seus interesses</Eyebrow>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none select-none opacity-60 blur-[2px]">
          <InterestsPlaceholder />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/40 px-6 text-center backdrop-blur-md">
          <div className="max-w-md space-y-2">
            <p className="text-body font-medium text-foreground">{title}</p>
            <p className="text-small text-muted">{description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">{actions}</div>
        </div>
      </div>
    </section>
  );
}

export function FeedInterestsGate({
  isAuthenticated,
  items,
  username,
}: FeedInterestsGateProps) {
  const { openAuthPrompt } = useAuthGate();

  if (isAuthenticated && items.length > 0) {
    return (
      <FeedSectionRow title="Dos seus interesses" items={items} />
    );
  }

  if (!isAuthenticated) {
    return (
      <InterestsGateOverlay
        title="Inscreva-se para personalizar essa seção"
        description="Escolha seus interesses e receba recomendações feitas para você."
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/register">Criar conta</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                openAuthPrompt(
                  "Crie uma conta para personalizar o feed com base nos seus interesses."
                )
              }
            >
              Saiba mais
            </Button>
          </>
        }
      />
    );
  }

  return (
    <InterestsGateOverlay
      title="Configure seus interesses para ver recomendações."
      description="Escolha categorias no seu perfil e receba recomendações feitas para você."
      actions={
        username ? (
          <Button asChild size="sm">
            <Link href={`/users/${encodeURIComponent(username)}`}>
              Editar interesses no perfil
            </Link>
          </Button>
        ) : null
      }
    />
  );
}
