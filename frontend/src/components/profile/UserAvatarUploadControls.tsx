"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserAvatarUploadControlsProps {
  previewUrl: string | null;
  disabled?: boolean;
  isUploading?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
  align?: "start" | "end";
  className?: string;
}

export function UserAvatarUploadControls({
  previewUrl,
  disabled = false,
  isUploading = false,
  onSelect,
  onRemove,
  align = "start",
  className,
}: UserAvatarUploadControlsProps) {
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
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "end" && "items-end text-right",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={isBusy}
        onChange={handleFileChange}
        aria-label="Selecionar foto de perfil"
      />

      <div
        className={cn(
          "flex flex-wrap gap-2",
          align === "end" ? "justify-end" : "justify-start"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={openFilePicker}
        >
          {previewUrl ? "Trocar foto" : "Enviar foto"}
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={onRemove}
          >
            Remover
          </Button>
        )}
      </div>

      <p className="max-w-xs text-small text-muted">
        JPEG, PNG, WebP ou GIF até 50 MB.
      </p>
    </div>
  );
}
