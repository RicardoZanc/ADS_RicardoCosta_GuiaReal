import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-sans text-h3 font-semibold leading-snug text-foreground">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-body leading-relaxed text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
