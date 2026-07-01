"use client";

import { AlertCircleIcon } from "lucide-react";

interface ChatAssistantErrorProps {
  message: string;
}

export function ChatAssistantError({ message }: ChatAssistantErrorProps) {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 shadow-[var(--shadow-card)]">
        <AlertCircleIcon
          className="mt-0.5 size-4 shrink-0 text-destructive"
          aria-hidden
        />
        <p className="text-body text-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
