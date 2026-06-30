"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { notifyApiError } from "@/lib/notifyApiError";
import { createAdminRequest } from "@/lib/adminRequests";
import type { AdminRequestItem } from "@/lib/types/adminRequests";

const MIN_MESSAGE_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 2000;

interface AdminRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (request: AdminRequestItem) => void;
}

export function AdminRequestDialog({
  open,
  onOpenChange,
  onCreated,
}: AdminRequestDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedLength = message.trim().length;
  const canSubmit =
    trimmedLength >= MIN_MESSAGE_LENGTH && trimmedLength <= MAX_MESSAGE_LENGTH;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setMessage("");
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const request = await createAdminRequest({ message: message.trim() });
      onCreated(request);
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      notifyApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar ser administrador</DialogTitle>
          <DialogDescription>
            Explique por que você seria um bom administrador da comunidade.
            Administradores moderam denúncias e ajudam a manter a qualidade das
            discussões.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Descreva sua experiência, motivação e como você contribuiria para a moderação..."
            rows={6}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={isSubmitting}
          />
          <p className="text-small text-muted">
            {trimmedLength}/{MAX_MESSAGE_LENGTH} caracteres
            {trimmedLength < MIN_MESSAGE_LENGTH
              ? ` · mínimo ${MIN_MESSAGE_LENGTH}`
              : null}
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!canSubmit || isSubmitting}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
