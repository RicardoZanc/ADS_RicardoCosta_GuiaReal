"use client";

import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chats";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "USER";

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-body leading-relaxed",
          isUser
            ? "bg-accent/15 text-foreground ring-1 ring-accent/25"
            : "bg-card text-foreground ring-1 ring-border/40"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted/30 [&_pre]:p-3">
            <Markdown>{message.content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
