"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  connectChatSocket,
  joinChatRoom,
  subscribeChatSocket,
} from "@/lib/chatSocket";
import {
  CHAT_ASSISTANT_TIMEOUT_MESSAGE,
  getChatAssistantInactivityTimeoutMs,
} from "@/lib/chatAssistantTimeout";
import {
  createChat,
  fetchChat,
  fetchChats,
  retryChatAssistant,
  sendChatMessage,
} from "@/lib/chats";
import { notifyApiError } from "@/lib/notifyApiError";
import type { ChatAgentProgressEvent, ChatMessage, ChatSummary } from "@/lib/types/chats";
import { useAuthStore } from "@/store/authStore";
import {
  getSidebarCollapsed,
  setSidebarCollapsed,
} from "@/components/chat/ChatSidebar";

export function useChatController(chatId?: string) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [title, setTitle] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(Boolean(chatId));
  const [isSending, setIsSending] = useState(false);
  const [isAwaitingAssistant, setIsAwaitingAssistant] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [assistantActivityTick, setAssistantActivityTick] = useState(0);
  const [agentProgress, setAgentProgress] =
    useState<ChatAgentProgressEvent | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const bumpAssistantActivity = useCallback(() => {
    setAssistantActivityTick((tick) => tick + 1);
  }, []);

  const loadChats = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const response = await fetchChats();
      setChats(response.data);
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  const loadChat = useCallback(async (targetChatId: string) => {
    setIsLoadingChat(true);
    try {
      const chat = await fetchChat(targetChatId);
      setMessages(chat.messages);
      setTitle(chat.title);
      const awaiting = chat.messages.at(-1)?.sender === "USER";
      setIsAwaitingAssistant(awaiting);
      setAssistantError(null);
      if (awaiting) {
        bumpAssistantActivity();
      }
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsLoadingChat(false);
    }
  }, [bumpAssistantActivity]);

  useEffect(() => {
    setIsSidebarCollapsed(getSidebarCollapsed());
    void loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setTitle(null);
      setIsLoadingChat(false);
      setIsAwaitingAssistant(false);
      setAssistantError(null);
      setAgentProgress(null);
      return;
    }

    void loadChat(chatId);
  }, [chatId, loadChat]);

  useEffect(() => {
    if (!accessToken) return;

    connectChatSocket(accessToken);

    const unsubscribe = subscribeChatSocket({
      onAssistantMessage: (event) => {
        if (chatId && event.chatId !== chatId) return;

        bumpAssistantActivity();
        setMessages((prev) => {
          if (prev.some((message) => message.id === event.message.id)) {
            return prev;
          }
          return [...prev, event.message];
        });
        setIsAwaitingAssistant(false);
        setAssistantError(null);
        setAgentProgress(null);
      },
      onAgentProgress: (event) => {
        if (chatId && event.chatId !== chatId) return;
        bumpAssistantActivity();
        setAgentProgress(event);
      },
      onTitleUpdated: (event) => {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === event.chatId ? { ...chat, title: event.title } : chat
          )
        );

        if (!chatId || event.chatId === chatId) {
          setTitle(event.title);
          bumpAssistantActivity();
        }
      },
      onError: (event) => {
        toast.error(event.message);
        setAssistantError(event.message);
        setIsAwaitingAssistant(false);
        setAgentProgress(null);
      },
    });

    return unsubscribe;
  }, [accessToken, chatId, bumpAssistantActivity]);

  useEffect(() => {
    if (!chatId || !accessToken) return;
    joinChatRoom(chatId);
  }, [chatId, accessToken]);

  useEffect(() => {
    if (!isAwaitingAssistant) return;

    const timeoutMs = getChatAssistantInactivityTimeoutMs();
    const timeoutId = window.setTimeout(() => {
      setAssistantError(CHAT_ASSISTANT_TIMEOUT_MESSAGE);
      setIsAwaitingAssistant(false);
      setAgentProgress(null);
      toast.error(CHAT_ASSISTANT_TIMEOUT_MESSAGE);
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [isAwaitingAssistant, assistantActivityTick]);

  function toggleSidebarCollapse() {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      setSidebarCollapsed(next);
      return next;
    });
  }

  async function sendMessage(content: string) {
    if (isSending || isAwaitingAssistant) return;

    setIsSending(true);
    setAssistantError(null);

    try {
      if (!chatId) {
        const chat = await createChat(content);
        setChats((prev) => [
          {
            id: chat.id,
            user_id: chat.user_id,
            title: chat.title,
            created_at: chat.created_at,
          },
          ...prev.filter((item) => item.id !== chat.id),
        ]);
        setIsAwaitingAssistant(true);
        setAgentProgress(null);
        bumpAssistantActivity();
        router.push(`/chat/${chat.id}`);
        return;
      }

      const response = await sendChatMessage(chatId, content);
      setMessages((prev) => [...prev, response.message]);
      setIsAwaitingAssistant(true);
      setAgentProgress(null);
      bumpAssistantActivity();
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSending(false);
    }
  }

  async function retryAssistant() {
    if (!chatId || isSending || isAwaitingAssistant) return;

    setIsSending(true);
    setAssistantError(null);

    try {
      await retryChatAssistant(chatId);
      setIsAwaitingAssistant(true);
      setAgentProgress(null);
      bumpAssistantActivity();
    } catch (error) {
      if (notifyApiError(error)) {
        setAssistantError("Não foi possível reenviar a mensagem. Tente novamente.");
        return;
      }
      throw error;
    } finally {
      setIsSending(false);
    }
  }

  return {
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
  };
}
