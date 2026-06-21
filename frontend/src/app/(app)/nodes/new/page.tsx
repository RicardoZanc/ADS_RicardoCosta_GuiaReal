"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NodeSearchField } from "@/components/product-create/NodeSearchField";
import { SelectedNodeCard } from "@/components/product-create/SelectedNodeCard";
import { TIPO_PARENT_CONFIG } from "@/lib/nodeCreate/constants";
import type { NodeType } from "@/lib/types/nodes";
import { cn } from "@/lib/utils";
import { useNodeCreateController } from "./controller";

function NodeNameForm({
  value,
  placeholder,
  disabled,
  canSubmit,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  value: string;
  placeholder: string;
  disabled?: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex gap-3 sm:flex-row sm:items-start">
      <Input
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="m-auto">
          <Button
            type="button"
            loading={isSubmitting}
            disabled={disabled || !canSubmit}
            onClick={onSubmit}
          >
            Criar
          </Button>
        </div>
      
    </div>
  );
}

export default function NodeCreatePage() {
  const {
    selectedType,
    typeConfig,
    typeOptions,
    isCategoriaFlow,
    selectedTipo,
    nodeName,
    setNodeName,
    isSubmitting,
    canSubmitCreate,
    duplicate,
    tipoSearch,
    selectType,
    selectTipo,
    swapTipo,
    createTipo,
    submitCreate,
    useExistingDuplicate,
    dismissDuplicate,
    cancel,
  } = useNodeCreateController();

  const nameFormDisabled = isSubmitting || (isCategoriaFlow && !selectedTipo);

  return (
    <div className="mx-auto flex-1 flex flex-col justify-center w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
            Tópico
          </p>
          <h1 className="font-sans text-h3 font-bold tracking-tight text-foreground">
            {typeConfig.title}
          </h1>
          <p className="max-w-2xl text-body text-muted">{typeConfig.helperText}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={cancel}>
          Cancelar
        </Button>
      </div>

      <div className="mb-6">
        <label
          htmlFor="node-type"
          className="mb-3 block font-mono text-small text-muted"
        >
          Tipo de tópico
        </label>
        <select
          id="node-type"
          value={selectedType}
          disabled={isSubmitting}
          onChange={(event) =>
            selectType(event.target.value as NodeType)
          }
          className={cn(
            "flex h-11 w-full rounded-lg border border-border/40 bg-card px-3 py-2 text-body text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {typeOptions.map((option) => (
            <option key={option.type} value={option.type}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {isCategoriaFlow ? (
          <>
            <section className="space-y-3">
              <div>
                <p className="text-small font-medium text-foreground">
                  {TIPO_PARENT_CONFIG.label}
                </p>
                <p className="mt-1 text-body text-muted">
                  {TIPO_PARENT_CONFIG.helperText}
                </p>
              </div>

              {selectedTipo ? (
                <SelectedNodeCard
                  node={selectedTipo}
                  disabled={isSubmitting}
                  onRename={() => {}}
                  onSwap={swapTipo}
                />
              ) : (
                <NodeSearchField
                  query={tipoSearch.query}
                  suggestions={tipoSearch.suggestions}
                  isLoading={tipoSearch.isLoading}
                  disabled={isSubmitting}
                  placeholder={TIPO_PARENT_CONFIG.searchPlaceholder}
                  onQueryChange={tipoSearch.setQuery}
                  onSelect={selectTipo}
                  onCreate={createTipo}
                />
              )}
            </section>

            <section className="space-y-3">
              <div>
                <p className="text-small font-medium text-foreground">
                  Categoria
                </p>
                <p className="mt-1 text-body text-muted">
                  Nome da categoria dentro do tipo selecionado.
                </p>
              </div>

              <NodeNameForm
                value={nodeName}
                placeholder={typeConfig.namePlaceholder}
                disabled={nameFormDisabled}
                canSubmit={canSubmitCreate}
                isSubmitting={isSubmitting}
                onChange={setNodeName}
                onSubmit={submitCreate}
              />
            </section>
          </>
        ) : (
          <NodeNameForm
            value={nodeName}
            placeholder={typeConfig.namePlaceholder}
            disabled={nameFormDisabled}
            canSubmit={canSubmitCreate}
            isSubmitting={isSubmitting}
            onChange={setNodeName}
            onSubmit={submitCreate}
          />
        )}

        {duplicate && (
          <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
            <p className="text-body text-foreground">
              Já existe um nó com o nome &ldquo;{duplicate.name}&rdquo;. Deseja
              usar o existente?
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                loading={isSubmitting}
                onClick={useExistingDuplicate}
              >
                Usar existente
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
                onClick={dismissDuplicate}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
