"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductImageField } from "@/components/product-create/ProductImageField";
import { getNodeTypeLabel } from "@/lib/nodeLabels";
import { useNodeEditController } from "./controller";

export default function NodeEditPage() {
  const {
    node,
    notFound,
    notAvailable,
    isLoading,
    nodeName,
    setNodeName,
    imagePreviewUrl,
    isUploadingImage,
    isSubmitting,
    canSubmit,
    pendingRequest,
    isAdmin,
    selectImage,
    removeImage,
    submit,
    cancel,
  } = useNodeEditController();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="skeleton-shimmer h-64 rounded-2xl border border-border/15" />
      </div>
    );
  }

  if (notAvailable) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <PageHeader
          eyebrow="Edição"
          title="Nó não disponível"
          description="Este nó não pode ser editado."
        />
        <Button asChild variant="outline" className="mt-8">
          <Link href="/feed">Voltar ao feed</Link>
        </Button>
      </div>
    );
  }

  if (notFound || !node) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <PageHeader
          eyebrow="Edição"
          title="Nó não encontrado"
          description="O nó que você procura não existe ou foi removido."
        />
        <Button asChild variant="outline" className="mt-8">
          <Link href="/feed">Voltar ao feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Edição de tópico"
          title={getNodeTypeLabel(node.type)}
          description={`Altere o nome ou a imagem de "${node.name}".`}
        />
        <Button type="button" variant="ghost" size="sm" onClick={cancel}>
          Cancelar
        </Button>
      </div>

      {pendingRequest ? (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-body text-foreground">
          Você já tem uma solicitação pendente para este tópico. Aguarde a
          revisão de um administrador.
        </div>
      ) : null}

      <div className="space-y-6">
        <section className="space-y-3">
          <div>
            <p className="text-small font-medium text-foreground">Nome</p>
            <p className="mt-1 text-body text-muted">
              Nome exibido para este tópico na taxonomia.
            </p>
          </div>
          <Input
            type="text"
            autoComplete="off"
            value={nodeName}
            disabled={isSubmitting || Boolean(pendingRequest)}
            onChange={(event) => setNodeName(event.target.value)}
          />
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-small font-medium text-foreground">
              Imagem (opcional)
            </p>
            <p className="mt-1 text-body text-muted">
              Atualize a foto que identifica este tópico.
            </p>
          </div>

          <ProductImageField
            previewUrl={imagePreviewUrl}
            disabled={isSubmitting || Boolean(pendingRequest)}
            isUploading={isUploadingImage}
            entityLabel="tópico"
            previewAlt="Pré-visualização da imagem do tópico"
            onSelect={selectImage}
            onRemove={removeImage}
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            loading={isSubmitting}
            disabled={!canSubmit || Boolean(pendingRequest)}
            onClick={() => void submit()}
          >
            {isAdmin ? "Salvar alterações" : "Enviar para revisão"}
          </Button>
          <Button type="button" variant="outline" onClick={cancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
