"use client";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatShell } from "@/components/chat/ChatShell";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
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
    agentProgress,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    sendMessage,
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
      {chatId && title && (
        <header className="border-b border-border/30 px-4 py-3">
          <h2 className="mx-auto max-w-3xl truncate font-sans text-body font-semibold text-foreground">
            {title}
          </h2>
        </header>
      )}

      {isLoadingChat && chatId ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-small text-muted">Carregando conversa…</p>
        </div>
      ) : showEmptyState ? (
        <ChatEmptyState />
      ) : showMessages ? (
        <ChatMessageList
          messages={messages}
          isAwaitingAssistant={isAwaitingAssistant}
          progressMessage={agentProgress?.message}
          progressStep={agentProgress?.step}
        />
      ) : null}

      <ChatComposer
        disabled={composerDisabled}
        isSending={isSending}
        onSend={sendMessage}
      />
    </ChatShell>
  );
}
