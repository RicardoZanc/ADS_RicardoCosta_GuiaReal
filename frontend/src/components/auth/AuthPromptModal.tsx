"use client";

import Link from "next/link";
import { MessageCircle, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AuthPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
  overlayClassName?: string;
}

const DEFAULT_REASON =
  "Crie uma conta gratuita para participar da comunidade, conversar com o assistente e personalizar seu feed.";

const BENEFITS = [
  {
    icon: MessageCircle,
    title: "Participe da comunidade",
    description: "Comente, responda e vote nas opiniões de outros usuários.",
  },
  {
    icon: Sparkles,
    title: "Assistente com IA",
    description: "Tire dúvidas sobre produtos com contexto real da plataforma.",
  },
  {
    icon: UserPlus,
    title: "Feed personalizado",
    description: "Receba recomendações baseadas nos seus interesses.",
  },
] as const;

export function AuthPromptModal({
  open,
  onOpenChange,
  reason = DEFAULT_REASON,
  overlayClassName,
}: AuthPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0"
        overlayClassName={cn("backdrop-blur-md", overlayClassName)}
      >
        <div className="border-b border-border/15 bg-accent/5 px-6 py-8 sm:px-8">
          <DialogHeader className="gap-3 px-0 pt-0">
            <DialogTitle className="text-h3 font-semibold">
              Junte-se ao GuiaReal
            </DialogTitle>
            <DialogDescription className="text-body text-muted">
              {reason}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-6 sm:px-8">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <benefit.icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-small font-medium text-foreground">
                  {benefit.title}
                </p>
                <p className="text-small text-muted">{benefit.description}</p>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link href="/register" onClick={() => onOpenChange(false)}>
                Criar conta
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/login" onClick={() => onOpenChange(false)}>
                Entrar
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
