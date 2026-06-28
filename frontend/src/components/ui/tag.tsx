import { cn } from "@/lib/utils";

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent";
}

export function Tag({
  className,
  variant = "default",
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-small font-normal leading-normal",
        variant === "accent"
          ? "bg-accent/10 text-accent/90"
          : "bg-muted/10 text-muted",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
