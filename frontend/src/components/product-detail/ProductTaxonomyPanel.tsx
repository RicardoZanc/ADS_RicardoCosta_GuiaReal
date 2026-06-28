import type { ProductDetailResponse } from "@/lib/types/products";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

interface ProductTaxonomyPanelProps {
  product: ProductDetailResponse;
}

function TaxonomyRow({
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

function TagList({
  label,
  items,
}: {
  label: string;
  items: { id: string; name: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <Eyebrow size="sm">{label}</Eyebrow>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Tag>{item.name}</Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductTaxonomyPanel({ product }: ProductTaxonomyPanelProps) {
  const { taxonomy } = product;
  const imageInitials =
    product.brand_name?.slice(0, 2).toUpperCase() ??
    product.name.slice(0, 2).toUpperCase();

  return (
    <section className="rounded-2xl border border-border/15 bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex gap-4">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="size-20 shrink-0 rounded-lg border border-border/15 object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex size-20 shrink-0 items-center justify-center rounded-lg",
              "border border-border/15 bg-muted/10 text-small font-medium text-muted"
            )}
            aria-hidden
          >
            {imageInitials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Eyebrow size="sm">Produto</Eyebrow>
          <h1 className="text-product-name mt-2">{product.name}</h1>
          {product.brand_name && (
            <p className="mt-1 text-body text-muted">{product.brand_name}</p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-border/15 pt-6">
        <TaxonomyRow label="Tipo" value={taxonomy.tipo?.name} />
        <TaxonomyRow label="Categoria" value={taxonomy.categoria?.name} />
        <TaxonomyRow label="Marca" value={taxonomy.marca?.name} />
        <TagList label="Tecnologias" items={taxonomy.tecnologias} />
        <TagList label="Composição" items={taxonomy.composicoes} />
        <TagList label="Atributos" items={taxonomy.atributos} />
      </div>
    </section>
  );
}
