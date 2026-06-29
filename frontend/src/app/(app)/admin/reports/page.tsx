"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { UserLink } from "@/components/profile/UserLink";
import { useAuthStore } from "@/store/authStore";
import {
  fetchAdminReports,
  updateAdminReport,
  REPORT_REASONS,
  type AdminReportItem,
  type ReportStatus,
} from "@/lib/reports";
import { ApiError } from "@/lib/errors";

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Pendente",
  UNDER_REVIEW: "Em análise",
  RESOLVED: "Procedente",
  REJECTED: "Improcedente",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR");
}

function reasonLabel(reason: string): string {
  return REPORT_REASONS.find((item) => item.value === reason)?.label ?? reason;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">(
    "PENDING"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAdminReports({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page: 1,
        limit: 50,
      });
      setReports(response.data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as denúncias"
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user?.is_admin) {
      router.replace("/feed");
      return;
    }
    void loadReports();
  }, [isHydrated, user, router, loadReports]);

  async function handleUpdate(
    reportId: string,
    status: Exclude<ReportStatus, "PENDING">
  ) {
    setActingId(reportId);
    try {
      await updateAdminReport(reportId, { status });
      await loadReports();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível atualizar a denúncia"
      );
    } finally {
      setActingId(null);
    }
  }

  if (!isHydrated || !user?.is_admin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="skeleton-shimmer h-8 w-32 rounded-lg" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <SectionHeader
        eyebrow="Administração"
        title="Moderação de denúncias"
        description="Analise denúncias de opiniões e comentários da comunidade."
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {(["ALL", "PENDING", "UNDER_REVIEW", "RESOLVED", "REJECTED"] as const).map(
          (status) => (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
            >
              {status === "ALL" ? "Todas" : STATUS_LABELS[status]}
            </Button>
          )
        )}
      </div>

      {error ? (
        <p className="mt-4 text-small text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-8 space-y-3">
          <div className="skeleton-shimmer h-24 rounded-xl" />
          <div className="skeleton-shimmer h-24 rounded-xl" />
        </div>
      ) : reports.length === 0 ? (
        <p className="mt-8 text-comment text-muted">
          Nenhuma denúncia encontrada para este filtro.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {reports.map((report) => (
            <li
              key={report.id}
              className="rounded-xl border border-border/15 bg-card/50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-small font-medium text-foreground">
                  {STATUS_LABELS[report.status]}
                </p>
                <p className="text-small text-muted">
                  {formatDate(report.created_at)}
                </p>
              </div>

              <p className="mt-2 text-small text-muted">
                Denunciante:{" "}
                <UserLink username={report.reporter.username} /> · Motivo:{" "}
                {reasonLabel(report.reason)}
              </p>

              <div className="mt-3 rounded-lg bg-muted/30 p-3">
                {report.target.title ? (
                  <p className="text-small font-medium text-foreground">
                    {report.target.title}
                  </p>
                ) : null}
                <p className="text-comment whitespace-pre-wrap text-foreground/90">
                  {report.target.content}
                </p>
                {report.target.author ? (
                  <p className="mt-2 text-small text-muted">
                    Autor:{" "}
                    <UserLink username={report.target.author.username} />
                  </p>
                ) : null}
              </div>

              {report.status === "PENDING" ||
              report.status === "UNDER_REVIEW" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.status === "PENDING" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={actingId === report.id}
                      onClick={() =>
                        void handleUpdate(report.id, "UNDER_REVIEW")
                      }
                    >
                      Em análise
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={actingId === report.id}
                    onClick={() => void handleUpdate(report.id, "RESOLVED")}
                  >
                    Procedente
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={actingId === report.id}
                    onClick={() => void handleUpdate(report.id, "REJECTED")}
                  >
                    Improcedente
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
