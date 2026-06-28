export type ChatSender = "USER" | "ASSISTANT";

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender: ChatSender;
  content: string;
  mentioned_evidences: unknown | null;
  mentioned_technical_facts: unknown | null;
  created_at: string;
}

export interface ChatSummary {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
}

export interface ChatDetail extends ChatSummary {
  messages: ChatMessage[];
}

export interface ChatsListResponse {
  data: ChatSummary[];
}

export type CreateChatResponse = ChatDetail;

export interface SendMessageResponse {
  message: ChatMessage;
}

export interface ChatAssistantMessageEvent {
  chatId: string;
  message: ChatMessage;
}

export interface ChatTitleUpdatedEvent {
  chatId: string;
  title: string;
}

export interface ChatErrorEvent {
  message: string;
}
