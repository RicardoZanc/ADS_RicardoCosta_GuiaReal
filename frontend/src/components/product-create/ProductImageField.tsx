"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductImageFieldProps {
  previewUrl: string | null;
  disabled?: boolean;
  isUploading?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

export function ProductImageField({
  previewUrl,
  disabled = false,
  isUploading = false,
  onSelect,
  onRemove,
}: ProductImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = disabled || isUploading;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onSelect(file);
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={isBusy}
        onChange={handleFileChange}
      />

      {previewUrl ? (
        <div className="space-y-3">
          <div
            className={cn(
              "relative mx-auto aspect-square w-full max-w-xs overflow-hidden",
              "border border-border/40 bg-muted/20"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Pré-visualização da imagem do produto"
              className="size-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <p className="font-mono text-small text-foreground">
                  Enviando imagem...
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={openFilePicker}
            >
              Trocar imagem
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={onRemove}
            >
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isBusy}
          onClick={openFilePicker}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-lg",
            "border border-dashed border-border/50 bg-muted/10 px-6 py-12",
            "text-center transition-colors hover:border-accent/50 hover:bg-muted/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className="font-mono text-small uppercase tracking-wide text-accent">
            Selecionar imagem
          </span>
          <span className="max-w-sm text-body text-muted">
            JPEG, PNG, WebP ou GIF até 50 MB. Este passo é opcional.
          </span>
          {isUploading && (
            <span className="text-small text-foreground">Enviando imagem...</span>
          )}
        </button>
      )}
    </div>
  );
}
