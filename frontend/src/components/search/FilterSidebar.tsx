"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FacetFilterPanel } from "@/components/search/FacetFilterPanel";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Button } from "@/components/ui/button";
import { useFacetFilter } from "@/hooks/useFacetFilter";
import { easeOut, fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { FacetType, SelectedFacetMeta } from "@/lib/types/search";

interface ScopeParams {
  tipo_id?: string;
  categoria_id?: string;
}

interface FilterSidebarProps {
  scopeParams: ScopeParams;
  selectedIds: Set<string>;
  selectedFacetMeta: Map<string, SelectedFacetMeta>;
  resetKey: number;
  hasActiveFilters: boolean;
  onToggle: (id: string, meta?: SelectedFacetMeta) => void;
  onClearFilters: () => void;
}

const FACET_SECTIONS: {
  type: FacetType;
  title: string;
  searchPlaceholder: string;
}[] = [
  {
    type: "TECNOLOGIA",
    title: "Tecnologia",
    searchPlaceholder: "Buscar tecnologias...",
  },
  {
    type: "COMPOSICAO",
    title: "Composição",
    searchPlaceholder: "Buscar composições...",
  },
  {
    type: "ATRIBUTO",
    title: "Atributo",
    searchPlaceholder: "Buscar atributos...",
  },
];

function FacetSection({
  facetType,
  title,
  searchPlaceholder,
  scopeParams,
  selectedIds,
  selectedFacetMeta,
  resetKey,
  onToggle,
}: {
  facetType: FacetType;
  title: string;
  searchPlaceholder: string;
  scopeParams: ScopeParams;
  selectedIds: Set<string>;
  selectedFacetMeta: Map<string, SelectedFacetMeta>;
  resetKey: number;
  onToggle: (id: string, meta?: SelectedFacetMeta) => void;
}) {
  const {
    query,
    setQuery,
    facets,
    pagination,
    isLoading,
    goToPreviousPage,
    goToNextPage,
  } = useFacetFilter({
    facetType,
    scopeParams,
    resetKey,
  });

  const selectedFacets = [...selectedFacetMeta.values()].filter(
    (facet) => facet.type === facetType
  );

  return (
    <FacetFilterPanel
      title={title}
      searchPlaceholder={searchPlaceholder}
      facets={facets}
      selectedFacets={selectedFacets}
      selectedIds={selectedIds}
      query={query}
      pagination={pagination}
      isLoading={isLoading}
      onQueryChange={setQuery}
      onToggle={(id) => {
        const facet = facets.find((item) => item.id === id);
        onToggle(
          id,
          facet
            ? { id: facet.id, name: facet.name, type: facetType }
            : selectedFacetMeta.get(id)
        );
      }}
      onPreviousPage={goToPreviousPage}
      onNextPage={goToNextPage}
    />
  );
}

export function FilterSidebar({
  scopeParams,
  selectedIds,
  selectedFacetMeta,
  resetKey,
  hasActiveFilters,
  onToggle,
  onClearFilters,
}: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const selectedCount = selectedIds.size;

  const sidebarContent = (
    <div className="divide-y divide-sidebar-border">
      {FACET_SECTIONS.map((section) => (
        <FacetSection
          key={section.type}
          facetType={section.type}
          title={section.title}
          searchPlaceholder={section.searchPlaceholder}
          scopeParams={scopeParams}
          selectedIds={selectedIds}
          selectedFacetMeta={selectedFacetMeta}
          resetKey={resetKey}
          onToggle={onToggle}
        />
      ))}
    </div>
  );

  const mobilePanelVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, height: 0 },
        visible: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
      };

  return (
    <div className="w-full min-w-0 lg:w-auto">
      <div className="lg:hidden">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between gap-2"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
        >
          <span>
            Filtros
            {selectedCount > 0 ? ` (${selectedCount})` : ""}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              isExpanded && "rotate-180"
            )}
            aria-hidden
          />
        </Button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.aside
              key="mobile-filters"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobilePanelVariants}
              transition={easeOut}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-small font-medium">Refinar busca</h2>
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onClearFilters}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
                {sidebarContent}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <aside className="hidden lg:sticky lg:top-6 lg:block">
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          transition={easeOut}
          className="rounded-xl border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground"
        >
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-sidebar-border pb-4">
            <h2 className="text-small font-medium">Filtros</h2>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearFilters}
              >
                Limpar
              </Button>
            )}
          </div>
          {sidebarContent}
        </motion.div>
      </aside>
    </div>
  );
}
