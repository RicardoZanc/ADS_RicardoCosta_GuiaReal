"use client";

import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chats";
import { useEffect, useRef } from "react";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isAwaitingAssistant: boolean;
}

export function ChatMessageList({
  messages,
  isAwaitingAssistant,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAwaitingAssistant]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isAwaitingAssistant && <ChatTypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
