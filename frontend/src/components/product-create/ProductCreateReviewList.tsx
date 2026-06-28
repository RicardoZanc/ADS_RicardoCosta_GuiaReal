"use client";

import { Eyebrow } from "@/components/ui/eyebrow";
import type { WizardStep } from "@/lib/productCreate/constants";

export interface ReviewItem {
  step: WizardStep;
  label: string;
  values: string[];
  emptyHint?: string;
  imagePreviewUrl?: string | null;
}

interface ProductCreateReviewListProps {
  items: ReviewItem[];
  disabled?: boolean;
  onNavigate: (step: WizardStep) => void;
}

export function ProductCreateReviewList({
  items,
  disabled = false,
  onNavigate,
}: ProductCreateReviewListProps) {
  return (
    <ul className="divide-y divide-border/15 overflow-hidden rounded-xl border border-border/15 shadow-[var(--shadow-card)]">
      {items.map((item) => {
        const isEmpty = item.values.length === 0;
        return (
          <li key={item.step}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onNavigate(item.step)}
              className="flex w-full items-start justify-between gap-4 bg-card px-4 py-3 text-left transition-colors hover:bg-muted/10 disabled:opacity-50"
            >
              <Eyebrow size="sm">{item.label}</Eyebrow>
              <span className="min-w-0 flex-1 text-right text-body text-foreground">
                {item.imagePreviewUrl ? (
                  <span className="inline-flex items-center justify-end gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imagePreviewUrl}
                      alt=""
                      className="size-10 rounded-lg border border-border/15 object-cover"
                    />
                    <span>{item.values[0] ?? "Imagem selecionada"}</span>
                  </span>
                ) : isEmpty ? (
                  <span className="text-muted">
                    {item.emptyHint ?? "Não informado"}
                  </span>
                ) : (
                  item.values.join(", ")
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
