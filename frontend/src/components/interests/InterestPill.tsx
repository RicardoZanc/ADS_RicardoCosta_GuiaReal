import { cn } from "@/lib/utils";

interface InterestPillProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function InterestPill({
  label,
  selected,
  disabled = false,
  onToggle,
}: InterestPillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "rounded-full border px-4 py-2 text-body transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-accent bg-accent/15 text-foreground"
          : "border-border/40 bg-transparent text-muted hover:border-border/60 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
