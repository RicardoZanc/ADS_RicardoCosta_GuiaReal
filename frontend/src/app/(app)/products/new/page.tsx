"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NodeSearchField } from "@/components/product-create/NodeSearchField";
import { SelectedNodeCard } from "@/components/product-create/SelectedNodeCard";
import { NodeTagList } from "@/components/product-create/NodeTagList";
import { ProductCreateReviewList } from "@/components/product-create/ProductCreateReviewList";
import { WizardNav } from "@/components/product-create/WizardNav";
import { useProductCreateController } from "./controller";

export default function ProductCreatePage() {
  const {
    stepConfig,
    stepIndex,
    totalSteps,
    isFirstStep,
    isReviewStep,
    canProceed,
    isSubmitting,
    currentSingleValue,
    currentMultiItems,
    modelRegister,
    modelError,
    search,
    duplicate,
    reviewItems,
    selectNode,
    createNode,
    useExistingDuplicate,
    dismissDuplicate,
    renameSelected,
    swapSelected,
    removeTag,
    goNext,
    goBack,
    goToStep,
    cancel,
    submit,
  } = useProductCreateController();

  return (
    <div className="w-full px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
            Cadastro de produto
          </p>
          <h1 className="font-sans text-h3 font-bold tracking-tight text-foreground">
            {stepConfig.title}
          </h1>
          <p className="max-w-2xl text-body text-muted">{stepConfig.helperText}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={cancel}>
          Cancelar
        </Button>
      </div>

      <p className="mb-4 font-mono text-small text-muted">
        Passo {stepIndex + 1} de {totalSteps}
      </p>

      <div className="space-y-4">
        {stepConfig.kind === "node-single" && (
          <>
            {currentSingleValue ? (
              <SelectedNodeCard
                node={currentSingleValue}
                disabled={isSubmitting}
                onRename={renameSelected}
                onSwap={swapSelected}
              />
            ) : (
              <NodeSearchField
                query={search.query}
                suggestions={search.suggestions}
                isLoading={search.isLoading}
                disabled={isSubmitting}
                placeholder={stepConfig.searchPlaceholder}
                onQueryChange={search.setQuery}
                onSelect={selectNode}
                onCreate={createNode}
              />
            )}
          </>
        )}

        {stepConfig.kind === "node-multi" && (
          <>
            <NodeTagList
              nodes={currentMultiItems}
              disabled={isSubmitting}
              onRemove={removeTag}
            />
            <NodeSearchField
              query={search.query}
              suggestions={search.suggestions}
              isLoading={search.isLoading}
              disabled={isSubmitting}
              placeholder={stepConfig.searchPlaceholder}
              onQueryChange={search.setQuery}
              onSelect={selectNode}
              onCreate={createNode}
            />
          </>
        )}

        {stepConfig.kind === "model" && (
          <div className="space-y-2">
            <label
              htmlFor="product-name"
              className="text-small font-medium text-foreground"
            >
              Nome do modelo
            </label>
            <Input
              id="product-name"
              type="text"
              autoComplete="off"
              placeholder="Ex.: RG450DX"
              error={!!modelError}
              {...modelRegister("name")}
            />
            {modelError && (
              <p className="text-sm text-red-400">{modelError.message}</p>
            )}
          </div>
        )}

        {stepConfig.kind === "review" && (
          <ProductCreateReviewList
            items={reviewItems}
            disabled={isSubmitting}
            onNavigate={goToStep}
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

      <WizardNav
        isFirstStep={isFirstStep}
        isReviewStep={isReviewStep}
        canProceed={canProceed}
        isBusy={isSubmitting}
        onBack={goBack}
        onNext={goNext}
        onSubmit={submit}
      />
    </div>
  );
}
