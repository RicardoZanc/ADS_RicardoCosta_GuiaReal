"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { UserLink } from "@/components/profile/UserLink";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function DiscussionSnippet({
  content,
  author,
  createdAt,
  isEvidence = false,
  className,
}: {
  content: string;
  author: ThreadPreviewItem["author"];
  createdAt: string;
  isEvidence?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2.5 transition-colors",
        isEvidence ? "bg-accent/8" : "bg-muted/5",
        className
      )}
    >
      <p className="text-comment whitespace-pre-wrap text-foreground/85">
        {content}
      </p>
      <p className="mt-1.5 text-small text-muted">
        <UserLink username={author.username} isAdmin={author.is_admin} nested />
        <span className="mx-1.5">·</span>
        {formatDate(createdAt)}
        {isEvidence ? (
          <span className="ml-1.5 text-accent/90">· citado na resposta</span>
        ) : null}
      </p>
    </div>
  );
}

function ThreadItemRow({ item }: { item: ThreadPreviewItem }) {
  return (
    <div className={item.depth > 0 ? getThreadLevelClass(item.depth) : undefined}>
      <DiscussionSnippet
        content={item.content}
        author={item.author}
        createdAt={item.created_at}
        isEvidence={item.is_evidence}
      />
    </div>
  );
}

interface EvidencePreviewCardProps {
  preview: EvidencePreview;
}

export function EvidencePreviewCard({ preview }: EvidencePreviewCardProps) {
  const discussionUrl = buildDiscussionUrl(preview);
  const isRootEvidence = preview.highlight_id === preview.root_opinion.id;
  const threadReplies = preview.thread_items.filter(
    (item) => item.kind === "thread"
  );

  const contextLabel =
    preview.context.type === "product"
      ? "Discussão no produto"
      : "Discussão no nó";

  return (
    <Card className="flex h-full min-h-0 flex-col border-border/15 shadow-[var(--shadow-card)]">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-product-name">{preview.context.title}</CardTitle>
            <CardDescription className="mt-1 text-small">{contextLabel}</CardDescription>
          </div>
          {preview.context.tab_label ? (
            <Tag variant="accent">{preview.context.tab_label}</Tag>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 overflow-y-auto border-t border-border/15 pt-4">
        <div className="flex gap-3">
          <UserAvatar
            username={preview.root_opinion.author.username}
            avatarUrl={preview.root_opinion.author.avatar_url}
            size="sm"
          />
          <div className="min-w-0 flex-1 space-y-2">
            {preview.root_opinion.title ? (
              <p className="text-small font-medium text-foreground">
                {preview.root_opinion.title}
              </p>
            ) : null}
            <DiscussionSnippet
              content={preview.root_opinion.content}
              author={preview.root_opinion.author}
              createdAt={preview.root_opinion.created_at}
              isEvidence={isRootEvidence}
            />
          </div>
        </div>

        {threadReplies.length > 0 ? (
          <ul className="space-y-2.5 pt-1">
            {threadReplies.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <ThreadItemRow item={item} />
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>

      <CardFooter className="justify-end gap-2 bg-muted/5">
        <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent">
          <Link href={discussionUrl} target="_blank" rel="noopener noreferrer">
            Ver discussão completa
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
