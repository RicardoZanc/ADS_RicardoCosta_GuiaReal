import { cn } from "@/lib/utils";

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "default" | "sm";
}

export function Eyebrow({
  className,
  size = "default",
  children,
  ...props
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center rounded-full bg-accent/10 font-medium text-accent",
        size === "sm" ? "px-2.5 py-0.5 text-small" : "px-3 py-1 text-small",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
