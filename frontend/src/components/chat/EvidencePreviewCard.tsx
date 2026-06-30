"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { UserLink } from "@/components/profile/UserLink";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { buildDiscussionUrl } from "@/lib/evidence";
import { getThreadLevelClass } from "@/components/product-detail/threadLayout";
import type { EvidencePreview, ThreadPreviewItem } from "@/lib/types/evidence";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ForumPost({
  title,
  content,
  author,
  createdAt,
  isEvidence = false,
  label,
  className,
}: {
  title?: string | null;
  content: string;
  author: ThreadPreviewItem["author"];
  createdAt: string;
  isEvidence?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "min-w-0",
        isEvidence &&
          "rounded-lg border border-accent/25 bg-accent/5 px-3 py-3 ring-1 ring-accent/10",
        className
      )}
    >
      {label ? (
        <p className="mb-1.5 text-small font-medium text-accent">{label}</p>
      ) : null}
      {title ? (
        <h4 className="mb-2 font-semibold leading-snug text-foreground">{title}</h4>
      ) : null}
      <p className="text-comment whitespace-pre-wrap text-foreground/90">{content}</p>
      <p className="mt-2 text-small text-muted">
        <UserLink username={author.username} isAdmin={author.is_admin} nested />
        <span className="mx-1.5">·</span>
        {formatDate(createdAt)}
      </p>
    </article>
  );
}

function ThreadItemRow({ item }: { item: ThreadPreviewItem }) {
  return (
    <li className={item.depth > 0 ? getThreadLevelClass(item.depth) : undefined}>
      <div className="flex gap-2.5">
        <UserAvatar
          username={item.author.username}
          avatarUrl={item.author.avatar_url}
          size="sm"
          className="mt-0.5 shrink-0"
        />
        <ForumPost
          content={item.content}
          author={item.author}
          createdAt={item.created_at}
          isEvidence={item.is_evidence}
          label={item.is_evidence ? "Fonte citada" : undefined}
          className="flex-1"
        />
      </div>
    </li>
  );
}

interface EvidencePreviewCardProps {
  preview: EvidencePreview;
  factLabel?: string;
}

export function EvidencePreviewCard({ preview, factLabel }: EvidencePreviewCardProps) {
  const discussionUrl = buildDiscussionUrl(preview);
  const isRootEvidence = preview.highlight_id === preview.root_opinion.id;
  const threadReplies = preview.thread_items.filter((item) => item.kind === "thread");

  const contextSuffix =
    preview.context.type === "product" ? "Produto" : "Nó";

  return (
    <div className="flex max-h-[min(78vh,36rem)] min-h-[16rem] flex-col overflow-hidden rounded-2xl border border-border/20 bg-card shadow-[var(--shadow-card)]">
      <header className="shrink-0 border-b border-border/15 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-small text-muted">{contextSuffix}</p>
            <h3 className="mt-0.5 text-product-name font-semibold text-foreground">
              {preview.context.title}
            </h3>
          </div>
          {preview.context.tab_label ? (
            <Tag variant="accent">{preview.context.tab_label}</Tag>
          ) : null}
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {factLabel ? (
          <blockquote className="border-l-[3px] border-accent/50 pl-4 text-small text-foreground/85">
            <p className="mb-1 text-small font-medium text-muted">Fato técnico</p>
            {factLabel}
          </blockquote>
        ) : null}

        <section>
          <p className="mb-2.5 text-small font-medium text-muted">Opinião origem</p>
          <div className="flex gap-3">
            <UserAvatar
              username={preview.root_opinion.author.username}
              avatarUrl={preview.root_opinion.author.avatar_url}
              size="sm"
              className="shrink-0"
            />
            <ForumPost
              title={preview.root_opinion.title}
              content={preview.root_opinion.content}
              author={preview.root_opinion.author}
              createdAt={preview.root_opinion.created_at}
              isEvidence={isRootEvidence}
              label={isRootEvidence ? "Fonte citada" : undefined}
              className="flex-1"
            />
          </div>
        </section>

        {threadReplies.length > 0 ? (
          <section>
            <p className="mb-2.5 text-small font-medium text-muted">Respostas</p>
            <ul className="space-y-4 border-t border-border/10 pt-4">
              {threadReplies.map((item) => (
                <ThreadItemRow key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <footer className="flex shrink-0 justify-end border-t border-border/15 bg-muted/5 px-5 py-3">
        <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent">
          <Link href={discussionUrl} target="_blank" rel="noopener noreferrer">
            Ver discussão completa
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </footer>
    </div>
  );
}
