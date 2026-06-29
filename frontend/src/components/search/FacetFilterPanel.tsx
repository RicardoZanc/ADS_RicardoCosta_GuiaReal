"use client";

import { Search } from "lucide-react";
import { InterestPill } from "@/components/interests/InterestPill";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import type { FeedPagination } from "@/lib/types/feed";
import type { FacetNode, SelectedFacetMeta } from "@/lib/types/search";

interface FacetFilterPanelProps {
  title: string;
  searchPlaceholder: string;
  facets: FacetNode[];
  selectedFacets: SelectedFacetMeta[];
  selectedIds: Set<string>;
  query: string;
  pagination: FeedPagination | null;
  isLoading: boolean;
  onQueryChange: (value: string) => void;
  onToggle: (id: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function FacetFilterPanel({
  title,
  searchPlaceholder,
  facets,
  selectedFacets,
  selectedIds,
  query,
  pagination,
  isLoading,
  onQueryChange,
  onToggle,
  onPreviousPage,
  onNextPage,
}: FacetFilterPanelProps) {
  const selectedCount = selectedFacets.length;

  return (
    <section className="space-y-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{title}</Eyebrow>
        {selectedCount > 0 && (
          <span className="text-small text-muted">
            {selectedCount} selecionado{selectedCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {selectedFacets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFacets.map((facet) => (
            <InterestPill
              key={facet.id}
              label={facet.name}
              selected
              onToggle={() => onToggle(facet.id)}
            />
          ))}
        </div>
      )}

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="pl-10"
          autoComplete="off"
          aria-label={searchPlaceholder}
        />
      </div>

      {isLoading ? (
        <p className="text-small text-muted">Carregando…</p>
      ) : facets.length === 0 ? (
        <p className="text-small text-muted">
          {query.trim()
            ? "Nenhum resultado para essa busca."
            : "Nenhuma opção disponível neste escopo."}
        </p>
      ) : (
        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
          {facets.map((facet) => (
            <InterestPill
              key={facet.id}
              label={`${facet.name} (${facet.productCount})`}
              selected={selectedIds.has(facet.id)}
              onToggle={() => onToggle(facet.id)}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-small text-muted">
            Pág. {pagination.page}/{pagination.totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isLoading}
              onClick={onPreviousPage}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                pagination.page >= pagination.totalPages || isLoading
              }
              onClick={onNextPage}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
