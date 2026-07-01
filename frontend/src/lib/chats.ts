import { apiClient } from "@/lib/api";
import type {
  ChatDetail,
  ChatsListResponse,
  CreateChatResponse,
  SendMessageResponse,
} from "@/lib/types/chats";

export function fetchChats(): Promise<ChatsListResponse> {
  return apiClient<ChatsListResponse>("/chats");
}

export function fetchChat(chatId: string): Promise<ChatDetail> {
  return apiClient<ChatDetail>(`/chats/${chatId}`);
}

export function createChat(content: string): Promise<CreateChatResponse> {
  return apiClient<CreateChatResponse>("/chats", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function sendChatMessage(
  chatId: string,
  content: string
): Promise<SendMessageResponse> {
  return apiClient<SendMessageResponse>(`/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function retryChatAssistant(
  chatId: string
): Promise<{ ok: true }> {
  return apiClient<{ ok: true }>(`/chats/${chatId}/retry`, {
    method: "POST",
  });
}
