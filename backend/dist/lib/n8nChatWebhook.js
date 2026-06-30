import { logger } from "../utils/logger";
function getN8nChatWebhookUrl() {
    const url = process.env.N8N_CHAT_WEBHOOK_URL?.trim();
    return url && url.length > 0 ? url : null;
}
export async function notifyN8nChatWebhook(payload) {
    const webhookUrl = getN8nChatWebhookUrl();
    if (!webhookUrl) {
        logger.warn("Webhook n8n chat não configurado (N8N_CHAT_WEBHOOK_URL)");
        return;
    }
    logger.debug("Enviando payload ao webhook n8n chat", {
        chatId: payload.chat_id,
        userId: payload.user_id,
        historyLength: payload.message_history.length,
    });
    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Webhook n8n chat retornou ${response.status}: ${body.slice(0, 200)}`);
    }
}
export function dispatchN8nChatWebhook(payload) {
    void notifyN8nChatWebhook(payload).catch((err) => {
        logger.warn("Falha ao enviar webhook n8n chat", {
            chatId: payload.chat_id,
            err,
        });
    });
}
