"use client";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatShell } from "@/components/chat/ChatShell";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useChatController } from "@/app/(chat)/chat/controller";

interface ChatPageContentProps {
  chatId?: string;
}

export function ChatPageContent({ chatId }: ChatPageContentProps) {
  const {
    chats,
    messages,
    title,
    isLoadingChats,
    isLoadingChat,
    isSending,
    isAwaitingAssistant,
    assistantError,
    agentProgress,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    sendMessage,
    retryAssistant,
  } = useChatController(chatId);

  const showEmptyState = !chatId && messages.length === 0;
  const showMessages = Boolean(chatId) && !isLoadingChat;
  const composerDisabled = isSending || isAwaitingAssistant;

  return (
    <ChatShell
      sidebar={
        <ChatSidebar
          chats={chats}
          activeChatId={chatId}
          isCollapsed={isSidebarCollapsed}
          isLoading={isLoadingChats}
          onToggleCollapse={toggleSidebarCollapse}
        />
      }
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/15 bg-background/80 px-4 py-3 backdrop-blur-md">
        <h2 className="min-w-0 flex-1 truncate text-body font-semibold text-foreground">
          {title ?? "Assistente"}
        </h2>
        <ThemeToggle />
      </header>

      {isLoadingChat && chatId ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="skeleton-shimmer h-8 w-48 rounded-lg" />
        </div>
      ) : showEmptyState ? (
        <ChatEmptyState />
      ) : showMessages ? (
        <ChatMessageList
          messages={messages}
          isAwaitingAssistant={isAwaitingAssistant}
          assistantError={assistantError}
          progressMessage={agentProgress?.message}
          progressStep={agentProgress?.step}
        />
      ) : null}

      <ChatComposer
        disabled={composerDisabled}
        isSending={isSending}
        assistantError={assistantError}
        onSend={sendMessage}
        onRetry={retryAssistant}
      />
    </ChatShell>
  );
}
