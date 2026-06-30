import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "size-3.5",
  md: "size-4",
} as const;

const containerClasses = {
  sm: "p-0.5",
  md: "p-1",
} as const;

export function AdminBadge({ className, size = "sm" }: AdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "border border-amber-400/40 bg-amber-400/15 text-amber-600",
        "dark:border-amber-300/35 dark:bg-amber-300/12 dark:text-amber-300",
        containerClasses[size],
        className
      )}
      title="Administrador"
      aria-label="Administrador"
    >
      <ShieldCheck className={sizeClasses[size]} aria-hidden />
    </span>
  );
}
