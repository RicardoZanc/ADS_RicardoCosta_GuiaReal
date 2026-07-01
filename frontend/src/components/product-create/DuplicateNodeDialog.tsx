"use client";

import { GitBranch } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface DuplicateNodeDialogProps {
  open: boolean;
  name: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateNodeDialog({
  open,
  name,
  isSubmitting = false,
  onConfirm,
  onOpenChange,
}: DuplicateNodeDialogProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md overflow-hidden p-0"
        showCloseButton={!isSubmitting}
      >
        <motion.div
          className="px-6 py-6"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <GitBranch className="size-5" aria-hidden />
            </div>
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
            <DialogHeader className="gap-2 px-0 pt-0">
              <DialogTitle>Tópico já existe</DialogTitle>
              <DialogDescription>
                Já existe um nó com o nome &quot;{name}&quot;. Deseja usar o
                existente?
              </DialogDescription>
            </DialogHeader>
          </motion.div>

          <motion.div
            className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
            variants={prefersReducedMotion ? undefined : staggerItem}
          >
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              loading={isSubmitting}
              onClick={onConfirm}
            >
              Usar existente
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
