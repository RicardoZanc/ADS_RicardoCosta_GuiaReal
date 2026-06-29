"use client";

import { ProductSearchCard } from "@/components/search/ProductSearchCard";
import type { ProductSearchItem } from "@/lib/types/search";

interface ProductSearchGridProps {
  products: ProductSearchItem[];
  emptyMessage: string;
}

export function ProductSearchGrid({
  products,
  emptyMessage,
}: ProductSearchGridProps) {
  if (products.length === 0) {
    return <p className="text-body text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductSearchCard key={product.id} product={product} />
      ))}
    </div>
  );
}
