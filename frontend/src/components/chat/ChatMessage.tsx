"use client";

import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import { hasMessageSources } from "@/lib/chatEvidence";
import { ChatMessageSources } from "@/components/chat/ChatMessageSources";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chats";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "USER";
  const facts = message.mentioned_technical_facts ?? [];
  const showSources = !isUser && hasMessageSources(message);

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-comment shadow-[var(--shadow-card)]",
          isUser
            ? "bg-accent/15 text-foreground ring-1 ring-accent/20"
            : "bg-card text-foreground ring-1 ring-border/15"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <div className="prose prose-invert prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted/30 [&_pre]:p-3">
              <Markdown>{message.content}</Markdown>
            </div>
            {showSources && (
              <ChatMessageSources
                facts={facts}
                evidences={message.mentioned_evidences}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
