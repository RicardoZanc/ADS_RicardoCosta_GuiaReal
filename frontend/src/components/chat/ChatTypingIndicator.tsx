"use client";

import { getAgentProgressStepLabel } from "@/lib/chatProgress";
import type { AgentProgressStep } from "@/lib/types/chats";

interface ChatTypingIndicatorProps {
  message?: string;
  step?: AgentProgressStep;
}

export function ChatTypingIndicator({ message, step }: ChatTypingIndicatorProps) {
  if (message) {
    return (
      <div className="flex justify-start">
        <div className="flex max-w-[85%] flex-col gap-1 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)] ring-1 ring-border/15">
          {step && (
            <p className="text-small font-medium text-accent">
              {getAgentProgressStepLabel(step)}
            </p>
          )}
          <div className="flex items-center gap-2.5">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-accent" />
            <p className="text-body text-muted leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)] ring-1 ring-border/15">
        <span className="size-2 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
        <span className="size-2 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
        <span className="size-2 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
      </div>
    </div>
  );
}
