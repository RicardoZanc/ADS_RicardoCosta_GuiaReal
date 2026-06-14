import type { NodeDetailResponse } from "@/lib/types/nodes";
import { getNodeTypeLabel } from "@/lib/nodeLabels";
import { cn } from "@/lib/utils";

interface NodeContextPanelProps {
  node: NodeDetailResponse;
}

function ContextRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="space-y-1">
      <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
        {label}
      </p>
      <p className="text-body text-foreground">{value}</p>
    </div>
  );
}

function formatOpinionCount(count: number): string {
  if (count === 0) return "Nenhuma opinião ainda";
  if (count === 1) return "1 opinião";
  return `${count} opiniões`;
}

export function NodeContextPanel({ node }: NodeContextPanelProps) {
  const typeLabel = getNodeTypeLabel(node.type);
  const initials = node.name.slice(0, 2).toUpperCase();

  return (
    <section className="space-y-6">
      <div className="flex gap-4">
        <div
          className={cn(
            "flex size-20 shrink-0 items-center justify-center",
            "border border-border/30 bg-muted/30 font-mono text-small text-muted"
          )}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
            {typeLabel}
          </p>
          <h1 className="mt-1 font-sans text-h2 font-bold text-foreground">
            {node.name}
          </h1>
          <p className="mt-1 text-body text-muted">
            {formatOpinionCount(node.opinionCount)}
          </p>
        </div>
      </div>

      {node.type === "CATEGORIA" && node.context.parentTipo && (
        <div className="space-y-4 border-t border-border/30 pt-6">
          <ContextRow label="Tipo" value={node.context.parentTipo.name} />
        </div>
      )}
    </section>
  );
}
