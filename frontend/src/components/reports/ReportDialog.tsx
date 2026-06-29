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
        onClick={() => setOpen(true)}
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

          {success ? (
            <p className="text-small text-foreground">
              Denúncia enviada com sucesso. Obrigado por ajudar a manter a
              comunidade segura.
            </p>
          ) : (
            <div className="space-y-3">
              <fieldset className="space-y-2">
                <legend className="text-small font-medium text-foreground">
                  Motivo
                </legend>
                {REPORT_REASONS.map((item) => (
                  <label
                    key={item.value}
                    className="flex cursor-pointer items-center gap-2 text-small text-foreground/90"
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={item.value}
                      checked={reason === item.value}
                      onChange={() => setReason(item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </fieldset>
              {error ? (
                <p className="text-small text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          )}

          <div className="flex justify-end gap-2 px-6 pb-6">
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
        </DialogContent>
      </Dialog>
    </>
  );
}
