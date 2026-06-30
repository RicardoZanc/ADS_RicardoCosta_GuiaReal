import type { NodeDetailResponse } from "@/lib/types/nodes";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Tag } from "@/components/ui/tag";
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
      <Eyebrow size="sm">{label}</Eyebrow>
      <p className="text-body text-foreground">{value}</p>
    </div>
  );
}

function formatOpinionCount(count: number): string {
  if (count === 0) return "Nenhuma opinião ainda";
  if (count === 1) return "1 opinião";
  return `${count} opiniões`;
}

function NodeImage({
  node,
  initials,
}: {
  node: NodeDetailResponse;
  initials: string;
}) {
  const frameClass =
    "size-20 shrink-0 overflow-hidden rounded-lg border border-border/15 bg-muted/10 lg:size-28 lg:rounded-2xl";

  if (node.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={node.image_url}
        alt={node.name}
        className={cn(frameClass, "object-cover")}
      />
    );
  }

  return (
    <div
      className={cn(
        frameClass,
        "flex items-center justify-center text-small font-medium text-muted"
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function NodeContextPanel({ node }: NodeContextPanelProps) {
  const typeLabel = getNodeTypeLabel(node.type);
  const initials = node.name.slice(0, 2).toUpperCase();

  return (
    <section className="rounded-2xl border border-border/15 bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-10">
        <NodeImage node={node} initials={initials} />
        <div className="min-w-0 lg:pt-1">
          <Tag variant="accent">{typeLabel}</Tag>
          <h1 className="text-product-name mt-2">{node.name}</h1>
          <p className="mt-1 text-body text-muted lg:text-h4">
            {formatOpinionCount(node.opinionCount)}
          </p>
        </div>
      </div>

      {node.type === "CATEGORIA" && node.context.parentTipo && (
        <div className="mt-6 border-t border-border/15 pt-6 lg:mt-8 lg:pt-8">
          <ContextRow label="Tipo" value={node.context.parentTipo.name} />
        </div>
      )}
    </section>
  );
}
