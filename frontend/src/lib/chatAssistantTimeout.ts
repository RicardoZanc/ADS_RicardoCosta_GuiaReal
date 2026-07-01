const DEFAULT_CHAT_ASSISTANT_INACTIVITY_TIMEOUT_MS = 120_000;

export function getChatAssistantInactivityTimeoutMs(): number {
  const raw = process.env.NEXT_PUBLIC_CHAT_ASSISTANT_INACTIVITY_TIMEOUT_MS;
  if (!raw) return DEFAULT_CHAT_ASSISTANT_INACTIVITY_TIMEOUT_MS;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_CHAT_ASSISTANT_INACTIVITY_TIMEOUT_MS;
  }

  return parsed;
}

export const CHAT_ASSISTANT_TIMEOUT_MESSAGE =
  "O assistente demorou demais para responder. Tente novamente.";
