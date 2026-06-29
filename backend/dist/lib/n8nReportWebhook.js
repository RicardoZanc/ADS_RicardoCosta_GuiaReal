import { logger } from "../utils/logger";
function getN8nReportWebhookUrl() {
    const url = process.env.N8N_REPORT_WEBHOOK_URL?.trim();
    return url && url.length > 0 ? url : null;
}
export async function notifyN8nReportWebhook(payload) {
    const webhookUrl = getN8nReportWebhookUrl();
    if (!webhookUrl) {
        logger.warn("Webhook n8n de denúncia não configurado (N8N_REPORT_WEBHOOK_URL)");
        return;
    }
    logger.debug("Enviando payload ao webhook n8n de denúncia", {
        reportId: payload.report_id,
        factCount: payload.fact_ids.length,
    });
    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Webhook n8n denúncia retornou ${response.status}: ${body.slice(0, 200)}`);
    }
}
export function dispatchN8nReportWebhook(payload) {
    void notifyN8nReportWebhook(payload).catch((err) => {
        logger.warn("Falha ao enviar webhook n8n de denúncia", {
            reportId: payload.report_id,
            err,
        });
    });
}
