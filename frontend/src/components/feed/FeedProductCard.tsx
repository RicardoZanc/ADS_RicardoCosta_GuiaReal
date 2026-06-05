import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiscussionPreviewList } from "@/components/feed/DiscussionPreviewList";
import type { FeedProduct } from "@/lib/types/feed";
import { cn } from "@/lib/utils";

const NODE_TYPE_LABELS: Record<string, string> = {
  CATEGORIA: "Categoria",
  MARCA: "Marca",
  TECNOLOGIA: "Tecnologia",
  COMPOSICAO: "Composição",
  ATRIBUTO: "Atributo",
};

interface FeedProductCardProps {
  product: FeedProduct;
}

export function FeedProductCard({ product }: FeedProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <Card className="flex h-full flex-col transition-colors hover:border-accent/50">
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            <div
              className={cn(
                "flex size-16 shrink-0 items-center justify-center",
                "border border-border/30 bg-muted/30 font-mono text-small text-muted"
              )}
              aria-hidden
            >
              {product.brand_name?.slice(0, 2).toUpperCase() ?? "GR"}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-h4 group-hover:text-accent">
                {product.name}
              </CardTitle>
              {product.brand_name && (
                <CardDescription className="mt-1">
                  {product.brand_name}
                </CardDescription>
              )}
            </div>
          </div>
          {product.nodes.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.nodes.map((node) => (
                <li
                  key={node.id}
                  className="border border-border/30 px-2 py-0.5 font-mono text-small text-muted"
                >
                  <span className="text-accent/80">
                    {NODE_TYPE_LABELS[node.type] ?? node.type}
                  </span>
                  {": "}
                  {node.name}
                </li>
              ))}
            </ul>
          )}
        </CardHeader>
        <CardContent className="mt-auto border-t border-border/30 pt-4">
          <DiscussionPreviewList previews={product.discussionPreviews} />
        </CardContent>
      </Card>
    </Link>
  );
}
