"use client";

import { X } from "lucide-react";
import { NodeSearchField } from "@/components/product-create/NodeSearchField";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { useNodeSearch } from "@/hooks/useNodeSearch";
import type { NodeRecord, SelectedNode } from "@/lib/types/nodes";

interface ScopeSelectorProps {
  tipo: SelectedNode | null;
  categoria: SelectedNode | null;
  onSelectTipo: (node: NodeRecord) => void;
  onSelectCategoria: (node: NodeRecord) => void;
  onClear: () => void;
}

export function ScopeSelector({
  tipo,
  categoria,
  onSelectTipo,
  onSelectCategoria,
  onClear,
}: ScopeSelectorProps) {
  const tipoSearch = useNodeSearch({ type: "TIPO" });
  const categoriaSearch = useNodeSearch({
    type: "CATEGORIA",
    tipoId: tipo?.id ?? null,
  });

  const hasScope = Boolean(tipo || categoria);

  function handleSelectTipo(node: NodeRecord) {
    onSelectTipo(node);
    tipoSearch.reset();
  }

  function handleSelectCategoria(node: NodeRecord) {
    onSelectCategoria(node);
    categoriaSearch.reset();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">Tipo</label>
          <NodeSearchField
            query={tipoSearch.query}
            suggestions={tipoSearch.suggestions}
            isLoading={tipoSearch.isLoading}
            placeholder="Ex.: Eletrônicos, Instrumentos Musicais"
            allowCreate={false}
            disabled={Boolean(categoria)}
            onQueryChange={tipoSearch.setQuery}
            onSelect={handleSelectTipo}
            onCreate={() => {}}
          />
        </div>

        <div className="space-y-2">
          <label className="text-small font-medium text-foreground">
            Categoria
          </label>
          <NodeSearchField
            query={categoriaSearch.query}
            suggestions={categoriaSearch.suggestions}
            isLoading={categoriaSearch.isLoading}
            placeholder="Ex.: Guitarras, Monitores"
            allowCreate={false}
            onQueryChange={categoriaSearch.setQuery}
            onSelect={handleSelectCategoria}
            onCreate={() => {}}
          />
        </div>
      </div>

      {hasScope && (
        <div className="flex flex-wrap items-center gap-2">
          {tipo && !categoria && (
            <Tag variant="accent">Tipo: {tipo.name}</Tag>
          )}
          {categoria && (
            <Tag variant="accent">Categoria: {categoria.name}</Tag>
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
        </div>
      )}
    </div>
  );
}
