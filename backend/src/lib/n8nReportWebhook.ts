import { logger } from "../utils/logger";
import type { ReportTargetType } from "../modules/reports/reports.domainRules";

export type N8nReportWebhookPayload = {
  report_id: string;
  source_type: ReportTargetType;
  source_id: string;
  reason: string;
  fact_ids: string[];
  resolution: "RESOLVED";
  admin_notes?: string | null;
};

function getN8nReportWebhookUrl(): string | null {
  const url = process.env.N8N_REPORT_WEBHOOK_URL?.trim();
  return url && url.length > 0 ? url : null;
}

export async function notifyN8nReportWebhook(
  payload: N8nReportWebhookPayload
): Promise<void> {
  const webhookUrl = getN8nReportWebhookUrl();
  if (!webhookUrl) {
    logger.warn(
      "Webhook n8n de denúncia não configurado (N8N_REPORT_WEBHOOK_URL)"
    );
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
    throw new Error(
      `Webhook n8n denúncia retornou ${response.status}: ${body.slice(0, 200)}`
    );
  }
}

export function dispatchN8nReportWebhook(
  payload: N8nReportWebhookPayload
): void {
  void notifyN8nReportWebhook(payload).catch((err) => {
    logger.warn("Falha ao enviar webhook n8n de denúncia", {
      reportId: payload.report_id,
      err,
    });
  });
}
