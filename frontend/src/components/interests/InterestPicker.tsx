"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MAX_USER_INTERESTS } from "@/lib/users";
import type { InterestOption } from "@/hooks/useInterestOptions";
import { InterestPill } from "./InterestPill";

interface InterestPickerProps {
  options: InterestOption[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  isLoading?: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  maxSelected?: number;
}

export function InterestPicker({
  options,
  selectedIds,
  onToggle,
  isLoading = false,
  query,
  onQueryChange,
  maxSelected = MAX_USER_INTERESTS,
}: InterestPickerProps) {
  const atLimit = selectedIds.size >= maxSelected;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Buscar interesses..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="pl-10"
          autoComplete="off"
        />
      </div>

      {isLoading ? (
        <p className="text-body text-muted">Carregando interesses...</p>
      ) : options.length === 0 ? (
        <p className="text-body text-muted">
          Nenhum interesse encontrado para essa busca.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {options.map((option) => {
            const selected = selectedIds.has(option.id);
            const disabled = atLimit && !selected;

            return (
              <InterestPill
                key={option.id}
                label={option.name}
                selected={selected}
                disabled={disabled}
                onToggle={() => onToggle(option.id)}
              />
            );
          })}
        </div>
      )}

      <p className="text-small text-muted">
        {selectedIds.size} selecionado{selectedIds.size === 1 ? "" : "s"} · máx.{" "}
        {maxSelected}
      </p>
    </div>
  );
}
