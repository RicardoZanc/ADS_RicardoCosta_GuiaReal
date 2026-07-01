"use client";

import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchEmptyStateProps {
  message: string;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}

export function SearchEmptyState({
  message,
  showClearFilters = false,
  onClearFilters,
}: SearchEmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-xl border border-border/15 bg-card/40 p-6">
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted/10 text-muted">
        <PackageSearch className="size-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-body font-medium text-foreground">
          Nenhum resultado
        </p>
        <p className="text-body text-muted">{message}</p>
      </div>
      {showClearFilters && onClearFilters && (
        <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
