"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createReport,
  REPORT_REASONS,
  type ReportReason,
  type ReportTargetType,
} from "@/lib/reports";
import { cn } from "@/lib/utils";
import { useAuthGate } from "@/hooks/useAuthGate";

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;
  disabled?: boolean;
  className?: string;
}

export function ReportDialog({
  targetType,
  targetId,
  disabled = false,
  className,
}: ReportDialogProps) {
  const { requireAuth } = useAuthGate();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      await createReport({
        target_type: targetType,
        target_id: targetId,
        reason,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar a denúncia"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
      setSuccess(false);
      setReason("SPAM");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("text-muted hover:text-destructive", className)}
        disabled={disabled}
        onClick={() => {
          if (
            !requireAuth(
              "Crie uma conta para denunciar conteúdo e ajudar na moderação."
            )
          ) {
            return;
          }
          setOpen(true);
        }}
      >
        <Flag size={14} strokeWidth={2} className="mr-1" aria-hidden />
        Denunciar
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar conteúdo</DialogTitle>
            <DialogDescription>
              Informe o motivo da denúncia. Nossa equipe irá analisar o conteúdo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 pb-6">
            {success ? (
              <p className="text-small text-foreground">
                Denúncia enviada com sucesso. Obrigado por ajudar a manter a
                comunidade segura.
              </p>
            ) : (
              <>
                <fieldset>
                  <legend className="mb-3 text-small font-medium text-foreground">
                    Motivo
                  </legend>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((item) => {
                      const isSelected = reason === item.value;

                      return (
                        <label
                          key={item.value}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-small transition-colors",
                            "has-focus-visible:ring-2 has-focus-visible:ring-accent/30",
                            isSelected
                              ? "border-accent/40 bg-accent/10 text-foreground"
                              : "border-border/15 bg-card/50 text-foreground/90 hover:border-border/30 hover:bg-muted/10"
                          )}
                        >
                          <input
                            type="radio"
                            name="report-reason"
                            value={item.value}
                            checked={isSelected}
                            onChange={() => setReason(item.value)}
                            className="size-4 shrink-0 accent-accent"
                          />
                          {item.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {error ? (
                  <p className="text-small text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
              </>
            )}

            <div className="flex justify-end gap-2">
              {success ? (
                <Button type="button" onClick={() => handleOpenChange(false)}>
                  Fechar
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar denúncia"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
