"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { NodeSearchField } from "@/components/product-create/NodeSearchField";
import { SelectedNodeCard } from "@/components/product-create/SelectedNodeCard";
import { NodeTagList } from "@/components/product-create/NodeTagList";
import { ProductCreateReviewList } from "@/components/product-create/ProductCreateReviewList";
import { ProductImageField } from "@/components/product-create/ProductImageField";
import { WizardNav } from "@/components/product-create/WizardNav";
import { useProductEditController } from "./controller";

export default function ProductEditPage() {
  const {
    product,
    notFound,
    isLoading,
    stepConfig,
    stepIndex,
    totalSteps,
    isFirstStep,
    isReviewStep,
    canProceed,
    isSubmitting,
    isUploadingImage,
    imagePreviewUrl,
    pendingRequest,
    isAdmin,
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
    selectImage,
    removeImage,
    goNext,
    goBack,
    goToStep,
    cancel,
    submit,
  } = useProductEditController();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="skeleton-shimmer h-64 rounded-2xl border border-border/15" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <PageHeader
          eyebrow="Edição"
          title="Produto não encontrado"
          description="O produto que você procura não existe ou foi removido."
        />
        <Button asChild variant="outline" className="mt-8">
          <Link href="/feed">Voltar ao feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex-1 flex flex-col justify-center max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Edição de produto"
          title={stepConfig.title}
          description={stepConfig.helperText}
        />
        <Button type="button" variant="ghost" size="sm" onClick={cancel}>
          Cancelar
        </Button>
      </div>

      {pendingRequest ? (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-body text-foreground">
          Você já tem uma solicitação pendente para este produto. Aguarde a
          revisão de um administrador.
        </div>
      ) : null}

      <p className="mb-4 text-small text-muted">
        Passo {stepIndex + 1} de {totalSteps}
      </p>

      <div className="space-y-4">
        {stepConfig.kind === "node-single" && (
          <>
            {currentSingleValue ? (
              <SelectedNodeCard
                node={currentSingleValue}
                disabled={isSubmitting || Boolean(pendingRequest)}
                onRename={renameSelected}
                onSwap={swapSelected}
              />
            ) : (
              <NodeSearchField
                query={search.query}
                suggestions={search.suggestions}
                isLoading={search.isLoading}
                disabled={isSubmitting || Boolean(pendingRequest)}
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
              disabled={isSubmitting || Boolean(pendingRequest)}
              onRemove={removeTag}
            />
            <NodeSearchField
              query={search.query}
              suggestions={search.suggestions}
              isLoading={search.isLoading}
              disabled={isSubmitting || Boolean(pendingRequest)}
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
              disabled={Boolean(pendingRequest)}
              {...modelRegister("name")}
            />
            {modelError && (
              <p className="text-sm text-red-400">{modelError.message}</p>
            )}
          </div>
        )}

        {stepConfig.kind === "image" && (
          <ProductImageField
            previewUrl={imagePreviewUrl}
            disabled={isSubmitting || Boolean(pendingRequest)}
            isUploading={isUploadingImage}
            onSelect={selectImage}
            onRemove={removeImage}
          />
        )}

        {stepConfig.kind === "review" && (
          <ProductCreateReviewList
            items={reviewItems}
            disabled={isSubmitting || Boolean(pendingRequest)}
            onNavigate={goToStep}
          />
        )}

        {duplicate && (
          <div className="rounded-xl border border-border/15 bg-muted/5 p-4">
            <p className="text-comment text-foreground">
              Já existe um nó com o nome &quot;{duplicate.name}&quot;. Deseja
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

        <WizardNav
          isFirstStep={isFirstStep}
          isReviewStep={isReviewStep}
          canProceed={canProceed && !pendingRequest}
          isBusy={isSubmitting || isUploadingImage}
          submitLabel={
            isAdmin ? "Salvar alterações" : "Enviar para revisão"
          }
          onBack={goBack}
          onNext={goNext}
          onSubmit={submit}
        />
      </div>
    </div>
  );
}
