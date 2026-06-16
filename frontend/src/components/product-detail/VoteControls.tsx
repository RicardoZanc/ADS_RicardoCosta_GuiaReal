import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserVote } from "@/lib/types/products";

interface VoteControlsProps {
  cachedUpvotes: number;
  userVote: UserVote;
  disabled?: boolean;
  onLike: () => void;
  onDislike: () => void;
}

export function VoteControls({
  cachedUpvotes,
  userVote,
  disabled = false,
  onLike,
  onDislike,
}: VoteControlsProps) {
  return (
    <div className="inline-flex items-center gap-0.5">
      <button
        type="button"
        disabled={disabled}
        onClick={onLike}
        aria-pressed={userVote === 1}
        aria-label="Curtir"
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
          userVote === 1 && "bg-accent/15 text-accent"
        )}
      >
        <ThumbsUp size={14} strokeWidth={2} absoluteStrokeWidth aria-hidden />
      </button>

      <span className="min-w-[2ch] text-center font-mono text-small tabular-nums text-muted">
        {cachedUpvotes}
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={onDislike}
        aria-pressed={userVote === -1}
        aria-label="Não curtir"
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
          userVote === -1 && "bg-destructive/15 text-destructive"
        )}
      >
        <ThumbsDown size={14} strokeWidth={2} absoluteStrokeWidth aria-hidden />
      </button>
    </div>
  );
}
