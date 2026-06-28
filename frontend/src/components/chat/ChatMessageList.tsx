"use client";

import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";
import type {
  AgentProgressStep,
  ChatMessage as ChatMessageType,
} from "@/lib/types/chats";
import { useEffect, useRef } from "react";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isAwaitingAssistant: boolean;
  progressMessage?: string;
  progressStep?: AgentProgressStep;
}

export function ChatMessageList({
  messages,
  isAwaitingAssistant,
  progressMessage,
  progressStep,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAwaitingAssistant, progressMessage, progressStep]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isAwaitingAssistant && (
          <ChatTypingIndicator message={progressMessage} step={progressStep} />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
