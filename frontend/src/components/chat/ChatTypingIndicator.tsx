"use client";

export function ChatTypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl bg-card px-4 py-3 ring-1 ring-border/40">
        <span className="size-2 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
        <span className="size-2 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
        <span className="size-2 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
      </div>
    </div>
  );
}
