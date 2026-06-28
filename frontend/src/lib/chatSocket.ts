import { io, type Socket } from "socket.io-client";
import type {
  ChatAssistantMessageEvent,
  ChatErrorEvent,
  ChatTitleUpdatedEvent,
} from "@/lib/types/chats";

let socket: Socket | null = null;
let currentToken: string | null = null;

function getSocketBaseUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export function connectChatSocket(accessToken: string): Socket {
  if (socket?.connected && currentToken === accessToken) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = accessToken;
  socket = io(getSocketBaseUrl(), {
    auth: { token: accessToken },
    autoConnect: true,
  });

  return socket;
}

export function getChatSocket(): Socket | null {
  return socket;
}

export function joinChatRoom(chatId: string): void {
  socket?.emit("chat:join", { chatId });
}

export function disconnectChatSocket(): void {
  socket?.disconnect();
  socket = null;
  currentToken = null;
}

export type ChatSocketHandlers = {
  onAssistantMessage?: (event: ChatAssistantMessageEvent) => void;
  onTitleUpdated?: (event: ChatTitleUpdatedEvent) => void;
  onError?: (event: ChatErrorEvent) => void;
};

export function subscribeChatSocket(handlers: ChatSocketHandlers): () => void {
  if (!socket) return () => undefined;

  const assistantHandler = (event: ChatAssistantMessageEvent) => {
    handlers.onAssistantMessage?.(event);
  };
  const titleHandler = (event: ChatTitleUpdatedEvent) => {
    handlers.onTitleUpdated?.(event);
  };
  const errorHandler = (event: ChatErrorEvent) => {
    handlers.onError?.(event);
  };

  socket.on("chat:assistant_message", assistantHandler);
  socket.on("chat:title_updated", titleHandler);
  socket.on("chat:error", errorHandler);

  return () => {
    socket?.off("chat:assistant_message", assistantHandler);
    socket?.off("chat:title_updated", titleHandler);
    socket?.off("chat:error", errorHandler);
  };
}
