"use client";

import type { WizardStep } from "@/lib/productCreate/constants";

export interface ReviewItem {
  step: WizardStep;
  label: string;
  values: string[];
  emptyHint?: string;
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
    <ul className="divide-y divide-border/30 overflow-hidden rounded-lg border border-border/40">
      {items.map((item) => {
        const isEmpty = item.values.length === 0;
        return (
          <li key={item.step}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onNavigate(item.step)}
              className="flex w-full items-start justify-between gap-4 bg-card px-4 py-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
            >
              <span className="shrink-0 font-mono text-small uppercase tracking-wide text-muted">
                {item.label}
              </span>
              <span className="min-w-0 flex-1 text-right text-body text-foreground">
                {isEmpty ? (
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
