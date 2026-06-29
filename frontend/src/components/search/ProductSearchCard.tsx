"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import type { ProductSearchItem } from "@/lib/types/search";
import { cn } from "@/lib/utils";

interface ProductSearchCardProps {
  product: ProductSearchItem;
}

export function ProductSearchCard({ product }: ProductSearchCardProps) {
  const imageInitials =
    product.brand_name?.slice(0, 2).toUpperCase() ?? "GR";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      <Card className="h-full border-border/15 transition-colors group-hover:border-accent/30 group-hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="size-16 shrink-0 rounded-lg border border-border/15 object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
            ) : (
              <div
                className={cn(
                  "flex size-16 shrink-0 items-center justify-center rounded-lg",
                  "border border-border/15 bg-muted/10 text-small font-medium text-muted"
                )}
                aria-hidden
              >
                {imageInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-product-name transition-colors group-hover:text-accent">
                {product.name}
              </CardTitle>
              {product.brand_name && (
                <CardDescription className="mt-0.5 text-small">
                  {product.brand_name}
                </CardDescription>
              )}
            </div>
          </div>

          {(product.categoria || product.marca) && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.categoria && (
                <li>
                  <Tag variant="accent">Categoria: {product.categoria.name}</Tag>
                </li>
              )}
              {product.marca && (
                <li>
                  <Tag>Marca: {product.marca.name}</Tag>
                </li>
              )}
            </ul>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
