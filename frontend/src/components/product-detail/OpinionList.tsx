"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { CreateReplyFormData } from "@/lib/schemas/productDetail";
import type { OpinionListItem, ReplyTarget } from "@/lib/types/products";
import { UserLink } from "@/components/profile/UserLink";
import { ReplyComposer } from "./ReplyComposer";
import { ThreadReplyNode } from "./ThreadReplyNode";
import { VoteControls } from "./VoteControls";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isReplyTarget(
  replyTarget: ReplyTarget,
  opinionId: string,
  parentInteractionId?: string
): boolean {
  if (!replyTarget || replyTarget.opinionId !== opinionId) {
    return false;
  }

  return replyTarget.parentInteractionId === parentInteractionId;
}

interface OpinionListProps {
  opinions: OpinionListItem[];
  replyTarget: ReplyTarget;
  isSubmittingReply: boolean;
  votingTargetId: string | null;
  replyRegister: UseFormRegister<CreateReplyFormData>;
  replyErrors: FieldErrors<CreateReplyFormData>;
  onStartReply: (opinionId: string, parentInteractionId?: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  onVoteOpinion: (opinionId: string) => void;
  onDislikeOpinion: (opinionId: string) => void;
  onVoteThread: (threadId: string) => void;
  onDislikeThread: (threadId: string) => void;
}

export function OpinionList({
  opinions,
  replyTarget,
  isSubmittingReply,
  votingTargetId,
  replyRegister,
  replyErrors,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onVoteOpinion,
  onDislikeOpinion,
  onVoteThread,
  onDislikeThread,
}: OpinionListProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  const onToggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (opinions.length === 0) {
    return (
      <p className="text-body text-muted italic">
        Nenhuma discussão ainda. Seja o primeiro a comentar.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {opinions.map((opinion) => {
        const isRootReplyActive = isReplyTarget(replyTarget, opinion.id);
        const isVoting = votingTargetId === opinion.id;

        return (
          <li key={opinion.id} className="min-w-0 overflow-x-hidden border border-border/30 p-4">
            <article>
              <p className="text-body text-foreground whitespace-pre-wrap">
                {opinion.content}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="font-mono text-small text-muted">
                  <UserLink username={opinion.author.username} /> ·{" "}
                  {formatDate(opinion.created_at)}
                </p>
                <VoteControls
                  cachedUpvotes={opinion.cached_upvotes}
                  userVote={opinion.user_vote}
                  disabled={isVoting}
                  onLike={() => onVoteOpinion(opinion.id)}
                  onDislike={() => onDislikeOpinion(opinion.id)}
                />
              </div>
            </article>

            {isRootReplyActive ? (
              <ReplyComposer
                register={replyRegister}
                errors={replyErrors}
                isSubmitting={isSubmittingReply}
                onSubmit={onSubmitReply}
                onCancel={onCancelReply}
              />
            ) : (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onStartReply(opinion.id)}
                >
                  Responder
                </Button>
              </div>
            )}

            {opinion.replies.length > 0 && (
              <ul className="mt-4 min-w-0 space-y-3 overflow-x-hidden border-t border-border/20 pt-4">
                {opinion.replies.map((reply) => (
                  <ThreadReplyNode
                    key={reply.id}
                    reply={reply}
                    opinionId={opinion.id}
                    depth={1}
                    replyTarget={replyTarget}
                    isSubmittingReply={isSubmittingReply}
                    votingTargetId={votingTargetId}
                    collapsedIds={collapsedIds}
                    replyRegister={replyRegister}
                    replyErrors={replyErrors}
                    onStartReply={onStartReply}
                    onCancelReply={onCancelReply}
                    onSubmitReply={onSubmitReply}
                    onToggleCollapse={onToggleCollapse}
                    onVoteThread={onVoteThread}
                    onDislikeThread={onDislikeThread}
                  />
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
