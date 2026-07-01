"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { NodeSearchField } from "@/components/product-create/NodeSearchField";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { useNodeSearch } from "@/hooks/useNodeSearch";
import { easeOut, fadeIn, scaleIn } from "@/lib/motion";
import type { NodeRecord, SelectedNode } from "@/lib/types/nodes";

interface ScopeSelectorProps {
  tipo: SelectedNode | null;
  categoria: SelectedNode | null;
  onSelectTipo: (node: NodeRecord) => void;
  onSelectCategoria: (node: NodeRecord) => void;
  onClearTipoSelection: () => void;
  onClearCategoriaSelection: () => void;
  onClear: () => void;
}

export function ScopeSelector({
  tipo,
  categoria,
  onSelectTipo,
  onSelectCategoria,
  onClearTipoSelection,
  onClearCategoriaSelection,
  onClear,
}: ScopeSelectorProps) {
  const prefersReducedMotion = useReducedMotion();
  const tipoSearch = useNodeSearch({ type: "TIPO" });
  const categoriaSearch = useNodeSearch({
    type: "CATEGORIA",
    tipoId: tipo?.id ?? null,
  });

  const hasScope = Boolean(tipo || categoria);
  const tipoValue = tipoSearch.query || tipo?.name || "";
  const categoriaValue = categoriaSearch.query || categoria?.name || "";

  function handleSelectTipo(node: NodeRecord) {
    onSelectTipo(node);
    tipoSearch.reset();
  }

  function handleSelectCategoria(node: NodeRecord) {
    onSelectCategoria(node);
    categoriaSearch.reset();
  }

  function handleTipoQueryChange(value: string) {
    if (tipo && value !== tipo.name) {
      onClearTipoSelection();
    }
    tipoSearch.setQuery(tipo && value === tipo.name ? "" : value);
  }

  function handleCategoriaQueryChange(value: string) {
    if (categoria && value !== categoria.name) {
      onClearCategoriaSelection();
    }
    categoriaSearch.setQuery(categoria && value === categoria.name ? "" : value);
  }

  const tagVariants = prefersReducedMotion ? fadeIn : scaleIn;

  return (
    <div className="w-full space-y-4">
      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
        <div className="min-w-0 space-y-2">
          <label className="text-small font-medium text-foreground">Tipo</label>
          <NodeSearchField
            query={tipoValue}
            suggestions={tipoSearch.suggestions}
            isLoading={tipoSearch.isLoading}
            placeholder="Ex.: Eletrônicos, Instrumentos Musicais"
            allowCreate={false}
            onQueryChange={handleTipoQueryChange}
            onSelect={handleSelectTipo}
            onCreate={() => {}}
          />
        </div>

        <div className="min-w-0 space-y-2">
          <label className="text-small font-medium text-foreground">
            Categoria
          </label>
          <NodeSearchField
            query={categoriaValue}
            suggestions={categoriaSearch.suggestions}
            isLoading={categoriaSearch.isLoading}
            placeholder="Ex.: Guitarras, Monitores"
            allowCreate={false}
            onQueryChange={handleCategoriaQueryChange}
            onSelect={handleSelectCategoria}
            onCreate={() => {}}
          />
        </div>
      </div>

      <AnimatePresence>
        {hasScope && (
          <motion.div
            key="scope-tags"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tagVariants}
            transition={easeOut}
            className="flex flex-wrap items-center gap-2"
          >
            {tipo && !categoria && (
              <Tag variant="accent">Tipo: {tipo.name}</Tag>
            )}
            {categoria && (
              <Tag variant="accent">Categoria: {categoria.name}</Tag>
            )}
            {tipo && categoria && (
              <Tag>Tipo: {tipo.name}</Tag>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onClear}
            >
              <X className="size-3.5" aria-hidden />
              Limpar escopo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
