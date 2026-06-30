"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserLink } from "@/components/profile/UserLink";
import { ChangeRequestDiffCard } from "@/components/admin/ChangeRequestDiffCard";
import {
  fetchChangeRequests,
  updateChangeRequest,
} from "@/lib/changeRequests";
import type {
  ChangeRequestItem,
  ChangeRequestStatus,
} from "@/lib/types/changeRequests";
import { ApiError } from "@/lib/errors";

const STATUS_LABELS: Record<ChangeRequestStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR");
}

export default function AdminChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ChangeRequestStatus | "ALL">(
    "PENDING"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchChangeRequests({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page: 1,
        limit: 50,
      });
      setRequests(response.data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as solicitações"
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function handleApprove(requestId: string) {
    setActingId(requestId);
    try {
      await updateChangeRequest(requestId, { status: "APPROVED" });
      setRejectingId(null);
      setRejectionReason("");
      await loadRequests();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível aprovar a solicitação"
      );
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(requestId: string) {
    const trimmed = rejectionReason.trim();
    if (!trimmed) {
      setError("Informe o motivo da rejeição");
      return;
    }

    setActingId(requestId);
    try {
      await updateChangeRequest(requestId, {
        status: "REJECTED",
        rejection_reason: trimmed,
      });
      setRejectingId(null);
      setRejectionReason("");
      await loadRequests();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível rejeitar a solicitação"
      );
    } finally {
      setActingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
          >
            {status === "ALL" ? "Todas" : STATUS_LABELS[status]}
          </Button>
        ))}
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
      ) : requests.length === 0 ? (
        <p className="mt-8 text-comment text-muted">
          Nenhuma solicitação encontrada para este filtro.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {requests.map((request) => (
            <li
              key={request.id}
              className="rounded-xl border border-border/15 bg-card/50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-small font-medium text-foreground">
                  {request.status ? STATUS_LABELS[request.status] : "—"}
                </p>
                <p className="text-small text-muted">
                  {formatDate(request.created_at)}
                </p>
              </div>

              <div className="mt-3">
                <ChangeRequestDiffCard request={request} />
              </div>

              {request.status === "REJECTED" && request.rejection_reason ? (
                <div className="mt-3 rounded-lg bg-destructive/10 p-3">
                  <p className="text-small font-medium text-foreground">
                    Motivo da rejeição
                  </p>
                  <p className="mt-1 text-comment whitespace-pre-wrap text-muted">
                    {request.rejection_reason}
                  </p>
                </div>
              ) : null}

              {request.status === "PENDING" ? (
                <div className="mt-4 space-y-3">
                  {rejectingId === request.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={rejectionReason}
                        onChange={(event) =>
                          setRejectionReason(event.target.value)
                        }
                        placeholder="Explique por que a solicitação não foi aprovada..."
                        rows={4}
                        disabled={actingId === request.id}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={
                            actingId === request.id ||
                            !rejectionReason.trim()
                          }
                          onClick={() => void handleReject(request.id)}
                        >
                          Confirmar rejeição
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={actingId === request.id}
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                            setError(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={actingId === request.id}
                        onClick={() => void handleApprove(request.id)}
                      >
                        Aprovar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={actingId === request.id}
                        onClick={() => {
                          setRejectingId(request.id);
                          setRejectionReason("");
                          setError(null);
                        }}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}

              {request.reviewer && request.reviewed_at ? (
                <p className="mt-3 text-small text-muted">
                  Revisado por <UserLink username={request.reviewer.username} />{" "}
                  em {formatDate(request.reviewed_at)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
