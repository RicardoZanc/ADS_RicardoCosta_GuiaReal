"use client";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { DuplicateNodeDialog } from "@/components/product-create/DuplicateNodeDialog";
import { NodeSearchField } from "@/components/product-create/NodeSearchField";
import { ProductImageField } from "@/components/product-create/ProductImageField";
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
    imagePreviewUrl,
    isUploadingImage,
    selectImage,
    removeImage,
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
        <SectionHeader
          eyebrow="Tópico"
          title={typeConfig.title}
          description={typeConfig.helperText}
        />
        <Button type="button" variant="ghost" size="sm" onClick={cancel}>
          Cancelar
        </Button>
      </div>

      <div className="mb-6">
        <label
          htmlFor="node-type"
          className="mb-3 block text-small font-medium text-muted"
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
            "flex h-11 w-full rounded-lg border border-border/15 bg-card px-3 py-2 text-body text-foreground transition-colors",
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

        <section className="space-y-3">
          <div>
            <p className="text-small font-medium text-foreground">
              Imagem (opcional)
            </p>
            <p className="mt-1 text-body text-muted">
              Adicione uma foto para identificar visualmente este tópico.
            </p>
          </div>

          <ProductImageField
            previewUrl={imagePreviewUrl}
            disabled={isSubmitting}
            isUploading={isUploadingImage}
            entityLabel="tópico"
            previewAlt="Pré-visualização da imagem do tópico"
            onSelect={selectImage}
            onRemove={removeImage}
          />
        </section>

      </div>

      <DuplicateNodeDialog
        open={duplicate !== null}
        name={duplicate?.name ?? ""}
        isSubmitting={isSubmitting}
        onConfirm={useExistingDuplicate}
        onOpenChange={(open) => {
          if (!open) dismissDuplicate();
        }}
      />
    </div>
  );
}
