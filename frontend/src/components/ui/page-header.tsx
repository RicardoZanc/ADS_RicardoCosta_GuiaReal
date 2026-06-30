import { FadeIn } from "@/components/motion/FadeIn";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
  centered?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  centered = false,
}: PageHeaderProps) {
  return (
    <FadeIn className={cn("mb-8 space-y-3", centered && "text-center", className)}>
      <Eyebrow className={centered ? "mx-auto" : undefined}>{eyebrow}</Eyebrow>
      <h1 className="font-sans text-h2 font-semibold leading-snug text-foreground">
        {title}
      </h1>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-body leading-relaxed text-muted",
            centered && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </FadeIn>
  );
}
