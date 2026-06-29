"use client";

import { Suspense } from "react";
import { Search } from "lucide-react";
import { FacetSection } from "@/components/search/FacetSection";
import { ProductSearchGrid } from "@/components/search/ProductSearchGrid";
import { ScopeSelector } from "@/components/search/ScopeSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useBuscaController } from "./controller";

function BuscaSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="skeleton-shimmer mb-10 h-24 rounded-xl" />
      <div className="space-y-6">
        <div className="skeleton-shimmer h-28 rounded-xl" />
        <div className="skeleton-shimmer h-40 rounded-xl" />
        <div className="skeleton-shimmer h-64 rounded-xl" />
      </div>
    </div>
  );
}

function BuscaPageContent() {
  const {
    tipo,
    categoria,
    selectedNodeIds,
    productQuery,
    setProductQuery,
    facets,
    products,
    pagination,
    hasScope,
    isLoading,
    isLoadingProducts,
    emptyProductsMessage,
    handleSelectTipo,
    handleSelectCategoria,
    handleClearScope,
    toggleFacet,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  } = useBuscaController();

  const hasActiveFilters =
    selectedNodeIds.size > 0 || productQuery.trim().length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Busca"
        title="Encontre o produto certo"
        description="Explore por tipo ou categoria e refine com tecnologias, composições e atributos já usados nos produtos."
        className="mb-10 lg:mb-12"
      />

      <div className="flex flex-col gap-10">
        <ScopeSelector
          tipo={tipo}
          categoria={categoria}
          onSelectTipo={handleSelectTipo}
          onSelectCategoria={handleSelectCategoria}
          onClear={handleClearScope}
        />

        {!hasScope ? (
          <p className="text-body text-muted">
            Selecione um tipo ou categoria para começar.
          </p>
        ) : isLoading && products.length === 0 ? (
          <p className="text-body text-muted">Carregando resultados…</p>
        ) : (
          <>
            <div className="flex flex-col gap-8">
              <FacetSection
                title="Tecnologia"
                facets={facets.tecnologias}
                selectedIds={selectedNodeIds}
                onToggle={toggleFacet}
              />
              <FacetSection
                title="Composição"
                facets={facets.composicoes}
                selectedIds={selectedNodeIds}
                onToggle={toggleFacet}
              />
              <FacetSection
                title="Atributo"
                facets={facets.atributos}
                selectedIds={selectedNodeIds}
                onToggle={toggleFacet}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
                    aria-hidden
                  />
                  <Input
                    type="search"
                    placeholder="Buscar por nome do produto..."
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>

                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>

              {isLoadingProducts ? (
                <p className="text-body text-muted">Atualizando produtos…</p>
              ) : (
                <ProductSearchGrid
                  products={products}
                  emptyMessage={emptyProductsMessage}
                />
              )}

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="text-small text-muted">
                    Página {pagination.page} de {pagination.totalPages} ·{" "}
                    {pagination.total} produto
                    {pagination.total === 1 ? "" : "s"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1 || isLoadingProducts}
                      onClick={goToPreviousPage}
                    >
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        pagination.page >= pagination.totalPages ||
                        isLoadingProducts
                      }
                      onClick={goToNextPage}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<BuscaSkeleton />}>
      <BuscaPageContent />
    </Suspense>
  );
}
