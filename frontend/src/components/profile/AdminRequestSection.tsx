"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Tag } from "@/components/ui/tag";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FadeIn } from "@/components/motion/FadeIn";
import { AdminRequestDialog } from "@/components/profile/AdminRequestDialog";
import type {
  AdminRequestEligibility,
  AdminRequestItem,
  AdminRequestStatus,
} from "@/lib/types/adminRequests";

const STATUS_LABELS: Record<AdminRequestStatus, string> = {
  PENDING: "Aguardando análise",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
};

const LOW_REPUTATION_TOOLTIP =
  "Reputação mínima de 50 pontos. Contribua com opiniões e receba upvotes para aumentar sua reputação.";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR");
}

function formatDateOnly(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pt-BR");
}

interface AdminRequestSectionProps {
  requests: AdminRequestItem[];
  eligibility: AdminRequestEligibility;
  reputationScore: number;
  onRequestCreated: (request: AdminRequestItem) => void;
}

export function AdminRequestSection({
  requests,
  eligibility,
  reputationScore,
  onRequestCreated,
}: AdminRequestSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const showMutedButton =
    !eligibility.can_request &&
    (eligibility.reason === "LOW_REPUTATION" || reputationScore < eligibility.min_reputation);

  const requestButton = (
    <Button
      type="button"
      variant={showMutedButton ? "outline" : "default"}
      size="sm"
      disabled={!eligibility.can_request}
      className={showMutedButton ? "text-muted opacity-60" : undefined}
      onClick={() => setDialogOpen(true)}
    >
      Solicitar ser administrador
    </Button>
  );

  return (
    <FadeIn>
      <section className="rounded-2xl border border-border/15 bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <Eyebrow className="mb-3">Administração</Eyebrow>
        <p className="text-body text-muted">
          Administradores moderam denúncias e ajudam a manter a comunidade
          saudável. Usuários com reputação de pelo menos{" "}
          {eligibility.min_reputation} pontos podem solicitar o cargo.
        </p>

        <div className="mt-4">
          {showMutedButton ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">{requestButton}</span>
                </TooltipTrigger>
                <TooltipContent>{LOW_REPUTATION_TOOLTIP}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            requestButton
          )}
        </div>

        {eligibility.reason === "PENDING_REQUEST" ? (
          <p className="mt-3 text-small text-muted">
            Sua solicitação está aguardando análise por um administrador.
          </p>
        ) : null}

        {eligibility.reason === "COOLDOWN" && eligibility.cooldown_ends_at ? (
          <p className="mt-3 text-small text-muted">
            Você poderá solicitar novamente em{" "}
            {formatDateOnly(eligibility.cooldown_ends_at)}.
          </p>
        ) : null}

        {requests.length > 0 ? (
          <ul className="mt-6 space-y-3 border-t border-border/15 pt-6">
            {requests.map((request) => (
              <li
                key={request.id}
                className="rounded-xl border border-border/10 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Tag
                    variant={request.status === "APPROVED" ? "accent" : "default"}
                    className={
                      request.status === "REJECTED"
                        ? "bg-destructive/10 text-destructive"
                        : request.status === "PENDING"
                          ? "border border-border/30 bg-transparent"
                          : undefined
                    }
                  >
                    {request.status
                      ? STATUS_LABELS[request.status]
                      : "Desconhecido"}
                  </Tag>
                  <p className="text-small text-muted">
                    {formatDate(request.created_at)}
                  </p>
                </div>

                <p className="mt-3 text-comment whitespace-pre-wrap text-foreground/90">
                  {request.message}
                </p>

                {request.status === "REJECTED" && request.rejection_reason ? (
                  <div className="mt-3 rounded-lg bg-destructive/10 p-3">
                    <p className="text-small font-medium text-foreground">
                      Motivo da rejeição
                    </p>
                    <p className="mt-1 text-comment whitespace-pre-wrap text-muted">
                      {request.rejection_reason}
                    </p>
                    {request.reviewer ? (
                      <p className="mt-2 text-small text-muted">
                        Revisado por @{request.reviewer.username}
                        {request.reviewed_at
                          ? ` em ${formatDate(request.reviewed_at)}`
                          : null}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {request.status === "APPROVED" && request.reviewed_at ? (
                  <p className="mt-3 text-small text-muted">
                    Aprovada
                    {request.reviewer
                      ? ` por @${request.reviewer.username}`
                      : null}{" "}
                    em {formatDate(request.reviewed_at)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <AdminRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreated={onRequestCreated}
        />
      </section>
    </FadeIn>
  );
}
