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

function ProductImage({
  product,
  imageInitials,
}: {
  product: ProductDetailResponse;
  imageInitials: string;
}) {
  const frameClass =
    "aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/15 bg-muted/5 lg:aspect-[4/5] lg:min-h-[22rem]";

  if (product.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image_url}
        alt={product.name}
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
      {imageInitials}
    </div>
  );
}

export function ProductTaxonomyPanel({ product }: ProductTaxonomyPanelProps) {
  const { taxonomy } = product;
  const imageInitials =
    product.brand_name?.slice(0, 2).toUpperCase() ??
    product.name.slice(0, 2).toUpperCase();

  return (
    <section className="rounded-2xl border border-border/15 bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
        <div className="order-2 flex min-w-0 flex-col lg:order-1">
          <div>
            <h1 className="text-product-name font-bold text-foreground">
              {product.name}
            </h1>
            <p className="mt-1 text-small text-muted">Produto</p>
            {product.brand_name && (
              <p className="mt-2 text-body text-muted lg:text-h4">
                {product.brand_name}
              </p>
            )}
          </div>

          <div className="mt-8 space-y-4 border-t border-border/15 pt-8 lg:mt-10 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-4 lg:pt-10">
            <TaxonomyRow label="Tipo" value={taxonomy.tipo?.name} />
            <TaxonomyRow label="Categoria" value={taxonomy.categoria?.name} />
            <TaxonomyRow label="Marca" value={taxonomy.marca?.name} />
            <TagList label="Tecnologias" items={taxonomy.tecnologias} />
            <TagList label="Composição" items={taxonomy.composicoes} />
            <TagList label="Atributos" items={taxonomy.atributos} />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <ProductImage product={product} imageInitials={imageInitials} />
        </div>
      </div>
    </section>
  );
}
