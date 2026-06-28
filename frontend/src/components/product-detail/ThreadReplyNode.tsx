import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { CreateReplyFormData } from "@/lib/schemas/productDetail";
import type { OpinionReply, ReplyTarget } from "@/lib/types/products";
import { UserLink } from "@/components/profile/UserLink";
import { cn } from "@/lib/utils";
import { ReplyComposer } from "./ReplyComposer";
import { VoteControls } from "./VoteControls";
import { getThreadLevelClass } from "./threadLayout";

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

interface ThreadReplyNodeProps {
  reply: OpinionReply;
  opinionId: string;
  depth: number;
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
  onVoteThread: (threadId: string) => void;
  onDislikeThread: (threadId: string) => void;
}

export function ThreadReplyNode({
  reply,
  opinionId,
  depth,
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
  onVoteThread,
  onDislikeThread,
}: ThreadReplyNodeProps) {
  const hasChildren = reply.replies.length > 0;
  const isCollapsed = collapsedIds.has(reply.id);
  const isActive = isReplyTarget(replyTarget, opinionId, reply.id);
  const isVoting = votingTargetId === reply.id;

  return (
    <li className={getThreadLevelClass(depth)}>
      <div className="flex min-w-0 items-start gap-1">
        {hasChildren ? (
          <button
            type="button"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => onToggleCollapse(reply.id)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Expandir ramo" : "Colapsar ramo"}
          >
            <ChevronDown
              size={14}
              strokeWidth={2}
              absoluteStrokeWidth
              className={cn(
                "origin-center transition-transform duration-200 ease-in-out",
                !isCollapsed && "-rotate-90"
              )}
              aria-hidden
            />
          </button>
        ) : (
          <span className="inline-block h-6 w-6 shrink-0" aria-hidden />
        )}

        <article className="min-w-0 flex-1 break-words">
          <p className="text-body text-foreground whitespace-pre-wrap">
            {reply.content}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <p className="font-mono text-small text-muted">
              <UserLink username={reply.author.username} /> ·{" "}
              {formatDate(reply.created_at)}
            </p>
            <VoteControls
              cachedUpvotes={reply.cached_upvotes}
              userVote={reply.user_vote}
              disabled={isVoting}
              onLike={() => onVoteThread(reply.id)}
              onDislike={() => onDislikeThread(reply.id)}
            />
          </div>
        </article>
      </div>

      {isActive ? (
        <ReplyComposer
          register={replyRegister}
          errors={replyErrors}
          isSubmitting={isSubmittingReply}
          onSubmit={onSubmitReply}
          onCancel={onCancelReply}
        />
      ) : (
        <div className="mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onStartReply(opinionId, reply.id)}
          >
            Responder
          </Button>
        </div>
      )}

      {hasChildren && !isCollapsed && (
        <ul className="mt-3 min-w-0 space-y-3 overflow-x-hidden">
          {reply.replies.map((child) => (
            <ThreadReplyNode
              key={child.id}
              reply={child}
              opinionId={opinionId}
              depth={depth + 1}
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
}
