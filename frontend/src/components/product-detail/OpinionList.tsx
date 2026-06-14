import { Button } from "@/components/ui/button";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { CreateReplyFormData } from "@/lib/schemas/productDetail";
import type { OpinionListItem } from "@/lib/types/products";
import { ReplyComposer } from "./ReplyComposer";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface OpinionListProps {
  opinions: OpinionListItem[];
  replyingToOpinionId: string | null;
  isSubmittingReply: boolean;
  replyRegister: UseFormRegister<CreateReplyFormData>;
  replyErrors: FieldErrors<CreateReplyFormData>;
  onStartReply: (opinionId: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
}

export function OpinionList({
  opinions,
  replyingToOpinionId,
  isSubmittingReply,
  replyRegister,
  replyErrors,
  onStartReply,
  onCancelReply,
  onSubmitReply,
}: OpinionListProps) {
  if (opinions.length === 0) {
    return (
      <p className="text-body text-muted italic">
        Nenhuma discussão ainda. Seja o primeiro a comentar.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {opinions.map((opinion) => (
        <li key={opinion.id} className="border border-border/30 p-4">
          <article>
            <p className="text-body text-foreground whitespace-pre-wrap">
              {opinion.content}
            </p>
            <p className="mt-2 font-mono text-small text-muted">
              @{opinion.author.username} · {formatDate(opinion.created_at)}
              {opinion.score > 0 ? ` · ${opinion.score} votos` : ""}
            </p>
          </article>

          {opinion.replies.length > 0 && (
            <ul className="mt-4 space-y-3 border-t border-border/20 pt-4">
              {opinion.replies.map((reply) => (
                <li key={reply.id} className="border-l-2 border-accent/30 pl-3">
                  <p className="text-body text-foreground whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  <p className="mt-1 font-mono text-small text-muted">
                    @{reply.author.username} · {formatDate(reply.created_at)}
                    {reply.cached_upvotes > 0
                      ? ` · ${reply.cached_upvotes} votos`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {replyingToOpinionId === opinion.id ? (
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
        </li>
      ))}
    </ul>
  );
}
