"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { motion } from "motion/react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/motion";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPrimitive.Overlay asChild data-slot="dialog-overlay" {...props}>
      <motion.div
        className={cn(
          "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm",
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0.01 } : easeOut}
      />
    </DialogPrimitive.Overlay>
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  overlayClassName,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  overlayClassName?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content asChild data-slot="dialog-content" {...props}>
        <motion.div
          className={cn(
            "fixed top-[12%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-border/20 bg-card p-0 shadow-[var(--shadow-card)] outline-none",
            className
          )}
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 8 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={prefersReducedMotion ? { duration: 0.01 } : easeOut}
        >
          {children}
          {showCloseButton && (
            <DialogClose className="absolute top-4 right-4 rounded-lg p-1 text-muted transition-colors hover:bg-muted/20 hover:text-foreground">
              <XIcon className="size-4" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 px-6 pt-6", className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-sans text-h4 font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-body text-muted", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
