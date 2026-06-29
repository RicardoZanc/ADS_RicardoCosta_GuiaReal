import { apiClient } from "@/lib/api";

export const REPORT_REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "OFFENSIVE", label: "Conteúdo ofensivo" },
  { value: "MISLEADING", label: "Informação enganosa" },
  { value: "OFF_TOPIC", label: "Fora do tema" },
  { value: "OTHER", label: "Outro" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];
export type ReportTargetType = "opinion" | "thread";
export type ReportStatus = "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

export type CreateReportPayload = {
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
};

export type CreateReportResponse = {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  status: ReportStatus;
  created_at: string;
  linked_fact_count: number;
};

export type AdminReportItem = {
  id: string;
  reason: ReportReason;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reporter: { id: string; username: string };
  reviewer: { id: string; username: string } | null;
  target: {
    type: ReportTargetType;
    id: string;
    title: string | null;
    content: string;
    is_hidden: boolean;
    reports_locked: boolean;
    author: { id: string; username: string } | null;
  };
};

export type AdminReportsResponse = {
  data: AdminReportItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function createReport(
  payload: CreateReportPayload
): Promise<CreateReportResponse> {
  return apiClient<CreateReportResponse>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminReports(params?: {
  status?: ReportStatus;
  page?: number;
  limit?: number;
}): Promise<AdminReportsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return apiClient<AdminReportsResponse>(
    `/reports${query ? `?${query}` : ""}`
  );
}

export function updateAdminReport(
  reportId: string,
  payload: { status: Exclude<ReportStatus, "PENDING">; admin_notes?: string }
): Promise<{
  id: string;
  status: ReportStatus;
  admin_notes: string | null;
  reviewed_at: string;
  target_type: ReportTargetType;
  target_id: string;
}> {
  return apiClient(`/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
