"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StaggerList, StaggerListItem } from "@/components/motion/StaggerList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import type { NodeRecord } from "@/lib/types/nodes";
import type { ProductSearchItem } from "@/lib/types/search";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LoadingSkeletons() {
  return (
    <div className="space-y-2 px-2">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="skeleton-shimmer h-12 rounded-lg"
          aria-hidden
        />
      ))}
    </div>
  );
}

function NodeResultItem({
  node,
  onSelect,
}: {
  node: NodeRecord;
  onSelect: (node: NodeRecord) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/10"
    >
      <span className="truncate text-body text-foreground">{node.name}</span>
      <Tag>{node.type}</Tag>
    </button>
  );
}

function ProductResultItem({
  product,
  onSelect,
}: {
  product: ProductSearchItem;
  onSelect: (product: ProductSearchItem) => void;
}) {
  const subtitleParts: string[] = [];

  if (product.brand_name) {
    subtitleParts.push(product.brand_name);
  }

  if (product.categoria) {
    subtitleParts.push(`Categoria: ${product.categoria.name}`);
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="flex w-full items-start justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/10"
    >
      <div className="min-w-0 flex-1">
        <span className="block truncate text-body text-foreground">
          {product.name}
        </span>
        {subtitleParts.length > 0 && (
          <span className="mt-0.5 block truncate text-small text-muted">
            {subtitleParts.join(" · ")}
          </span>
        )}
      </div>
      <Tag>Produto</Tag>
    </button>
  );
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    nodeResults,
    productResults,
    isLoading,
    hasSearched,
    reset,
  } = useGlobalSearch();

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open, reset]);

  function handleCreate() {
    onOpenChange(false);
    router.push("/create");
  }

  function handleSelectNode(node: NodeRecord) {
    onOpenChange(false);
    router.push(`/nodes/${node.id}`);
  }

  function handleSelectProduct(product: ProductSearchItem) {
    onOpenChange(false);
    router.push(`/products/${product.id}`);
  }

  const trimmed = query.trim();
  const showResults = trimmed.length >= 1;
  const hasNodeResults = nodeResults.length > 0;
  const hasProductResults = productResults.length > 0;
  const hasAnyResults = hasNodeResults || hasProductResults;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>Pesquisar</DialogTitle>
          <DialogDescription>
            Encontre tópicos, categorias, marcas e produtos da plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              ref={inputRef}
              type="search"
              value={query}
              placeholder="Buscar na plataforma…"
              autoComplete="off"
              className="pl-10"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="max-h-80 overflow-auto px-2 py-4">
          {!showResults ? (
            <p className="px-4 py-6 text-center text-body text-muted">
              Digite para começar a buscar.
            </p>
          ) : isLoading ? (
            <LoadingSkeletons />
          ) : !hasAnyResults ? (
            <p className="px-4 py-6 text-center text-body text-muted">
              Nenhum resultado encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {hasNodeResults && (
                <section>
                  <h3 className="px-4 pb-1 text-small font-medium text-muted">
                    Tópicos
                  </h3>
                  <StaggerList key={nodeResults.length} className="space-y-1">
                    {nodeResults.map((node) => (
                      <StaggerListItem key={node.id}>
                        <NodeResultItem
                          node={node}
                          onSelect={handleSelectNode}
                        />
                      </StaggerListItem>
                    ))}
                  </StaggerList>
                </section>
              )}

              {hasProductResults && (
                <section>
                  <h3 className="px-4 pb-1 text-small font-medium text-muted">
                    Produtos
                  </h3>
                  <StaggerList
                    key={productResults.length}
                    className="space-y-1"
                  >
                    {productResults.map((product) => (
                      <StaggerListItem key={product.id}>
                        <ProductResultItem
                          product={product}
                          onSelect={handleSelectProduct}
                        />
                      </StaggerListItem>
                    ))}
                  </StaggerList>
                </section>
              )}
            </div>
          )}
        </div>

        {hasSearched && !isLoading && (
          <div className="flex items-center justify-between gap-4 border-t border-border/15 px-6 py-4">
            <p className="text-body text-muted">
              Não encontrou o que você procura?
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleCreate}>
              Criar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
