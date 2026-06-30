"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { CreateReplyFormData } from "@/lib/schemas/productDetail";
import type { OpinionListItem, ReplyTarget } from "@/lib/types/products";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { UserLink } from "@/components/profile/UserLink";
import { ReplyComposer } from "./ReplyComposer";
import { ThreadReplyNode } from "./ThreadReplyNode";
import { VoteControls } from "./VoteControls";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { useAuthStore } from "@/store/authStore";

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

function OpinionCard({
  opinion,
  replyTarget,
  isSubmittingReply,
  votingTargetId,
  collapsedIds,
  replyRegister,
  replyErrors,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onToggleCollapse,
  onVoteOpinion,
  onDislikeOpinion,
  onVoteThread,
  onDislikeThread,
}: {
  opinion: OpinionListItem;
  replyTarget: ReplyTarget;
  isSubmittingReply: boolean;
  votingTargetId: string | null;
  collapsedIds: Set<string>;
  replyRegister: UseFormRegister<CreateReplyFormData>;
  replyErrors: FieldErrors<CreateReplyFormData>;
  onStartReply: (opinionId: string, parentInteractionId?: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  onToggleCollapse: (id: string) => void;
  onVoteOpinion: (opinionId: string) => void;
  onDislikeOpinion: (opinionId: string) => void;
  onVoteThread: (threadId: string) => void;
  onDislikeThread: (threadId: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isRootReplyActive = isReplyTarget(replyTarget, opinion.id);
  const isVoting = votingTargetId === opinion.id;
  const canReport =
    currentUserId !== opinion.author.id && !opinion.reports_locked;

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { x: 2 }}
      className="min-w-0 overflow-x-hidden rounded-xl border border-border/15 bg-card/50 p-4 transition-colors hover:border-accent/20 hover:bg-card hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex gap-3">
        <Link
          href={`/users/${encodeURIComponent(opinion.author.username)}`}
          className="shrink-0"
        >
          <UserAvatar
            username={opinion.author.username}
            avatarUrl={opinion.author.avatar_url}
            size="sm"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <article>
            <p className="text-comment whitespace-pre-wrap text-foreground/90">
              {opinion.content}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-small text-muted">
                <UserLink
                  username={opinion.author.username}
                  isAdmin={opinion.author.is_admin}
                /> ·{" "}
                {formatDate(opinion.created_at)}
              </p>
              <VoteControls
                cachedUpvotes={opinion.cached_upvotes}
                userVote={opinion.user_vote}
                disabled={isVoting}
                onLike={() => onVoteOpinion(opinion.id)}
                onDislike={() => onDislikeOpinion(opinion.id)}
              />
              {canReport ? (
                <ReportDialog targetType="opinion" targetId={opinion.id} />
              ) : null}
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
            <ul className="mt-4 min-w-0 space-y-3 overflow-x-hidden border-t border-border/15 pt-4">
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
        </div>
      </div>
    </motion.div>
  );
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
      <p className="text-comment text-muted">
        Nenhuma discussão ainda. Seja o primeiro a comentar.
      </p>
    );
  }

  return (
    <StaggerList className="space-y-4">
      {opinions.map((opinion) => (
        <StaggerItem key={opinion.id}>
          <OpinionCard
            opinion={opinion}
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
            onVoteOpinion={onVoteOpinion}
            onDislikeOpinion={onDislikeOpinion}
            onVoteThread={onVoteThread}
            onDislikeThread={onDislikeThread}
          />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
