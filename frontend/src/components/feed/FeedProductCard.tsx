"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiscussionPreviewList } from "@/components/feed/DiscussionPreviewList";
import type { FeedItem } from "@/lib/types/feed";
import { getNodeTypeLabel, NODE_TYPE_LABELS } from "@/lib/nodeLabels";
import { cn } from "@/lib/utils";

interface FeedProductCardProps {
  item: FeedItem;
}

function getItemHref(item: FeedItem): string {
  return item.kind === "product"
    ? `/products/${item.id}`
    : `/nodes/${item.id}`;
}

function getNodeTypeLabelForItem(item: FeedItem): string {
  const selfNode = item.nodes.find((node) => node.id === item.id);
  const type = selfNode?.type ?? item.nodes[0]?.type;
  if (!type) return "";
  return getNodeTypeLabel(type);
}

function ProductFeedCardContent({ item }: FeedProductCardProps) {
  const imageInitials =
    item.brand_name?.slice(0, 2).toUpperCase() ?? "GR";

  return (
    <Card className="transition-colors group-hover:border-accent/50">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="size-16 shrink-0 border border-border/30 object-cover"
            />
          ) : (
            <div
              className={cn(
                "flex size-16 shrink-0 items-center justify-center",
                "border border-border/30 bg-muted/30 font-mono text-small text-muted"
              )}
              aria-hidden
            >
              {imageInitials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-h4 group-hover:text-accent">
              {item.name}
            </CardTitle>
            {item.brand_name && (
              <CardDescription className="mt-1">
                {item.brand_name}
              </CardDescription>
            )}
          </div>
        </div>
        {item.nodes.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {item.nodes.map((node) => (
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
      <CardContent className="border-t border-border/30 pt-4">
        <DiscussionPreviewList previews={item.discussionPreviews} />
      </CardContent>
    </Card>
  );
}

function NodeFeedCardContent({ item }: FeedProductCardProps) {
  const typeLabel = getNodeTypeLabelForItem(item);

  return (
    <Card className="transition-colors group-hover:border-accent/50">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex size-16 shrink-0 items-center justify-center",
              "border border-border/30 bg-muted/30 font-mono text-small text-muted"
            )}
            aria-hidden
          >
            {item.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
            <CardTitle className="text-h4 group-hover:text-accent">
              {item.name}
            </CardTitle>
            {typeLabel && (
              <span className="shrink-0 border border-border/30 px-2 py-0.5 font-mono text-small text-muted">
                {typeLabel}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t border-border/30 pt-4">
        <DiscussionPreviewList previews={item.discussionPreviews} />
      </CardContent>
    </Card>
  );
}

export function FeedProductCard({ item }: FeedProductCardProps) {
  const router = useRouter();
  const href = getItemHref(item);

  function handleCardClick() {
    router.push(href);
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(href);
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="group block cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {item.kind === "product" ? (
        <ProductFeedCardContent item={item} />
      ) : (
        <NodeFeedCardContent item={item} />
      )}
    </div>
  );
}
