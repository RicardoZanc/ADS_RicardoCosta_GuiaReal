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
    "aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/15 bg-muted/5 lg:aspect-[4/5] lg:min-h-[22rem]";

  if (node.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={node.image_url}
        alt={node.name}
        className={cn(frameClass, "h-full w-full object-contain")}
      />
    );
  }

  return (
    <div
      className={cn(
        frameClass,
        "flex items-center justify-center text-h3 font-medium text-muted"
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
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
        <div className="order-2 flex min-w-0 flex-col lg:order-1">
          <div>
            <Tag variant="accent">{typeLabel}</Tag>
            <h1 className="text-product-name mt-2 font-bold text-foreground">
              {node.name}
            </h1>
            <p className="mt-2 text-body text-muted lg:text-h4">
              {formatOpinionCount(node.opinionCount)}
            </p>
          </div>

          {node.type === "CATEGORIA" && node.context.parentTipo && (
            <div className="mt-8 border-t border-border/15 pt-8 lg:mt-10 lg:pt-10">
              <ContextRow label="Tipo" value={node.context.parentTipo.name} />
            </div>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <NodeImage node={node} initials={initials} />
        </div>
      </div>
    </section>
  );
}
