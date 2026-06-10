"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import type { NodeRecord } from "@/lib/types/nodes";

interface NodeSearchFieldProps {
  query: string;
  suggestions: NodeRecord[];
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  onQueryChange: (value: string) => void;
  onSelect: (node: NodeRecord) => void;
  onCreate: (name: string) => void;
}

export function NodeSearchField({
  query,
  suggestions,
  isLoading,
  disabled = false,
  placeholder,
  onQueryChange,
  onSelect,
  onCreate,
}: NodeSearchFieldProps) {
  const listId = useId();
  const trimmed = query.trim();

  const hasExactMatch = suggestions.some(
    (node) => node.name.toLowerCase() === trimmed.toLowerCase()
  );
  const showCreate = trimmed.length >= 1 && !hasExactMatch;
  const showDropdown =
    trimmed.length >= 1 && (isLoading || suggestions.length > 0 || showCreate);

  return (
    <div className="relative">
      <Input
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-border/40 bg-card py-1 shadow-lg"
        >
          {isLoading && (
            <li className="px-3 py-2 text-small text-muted">Buscando…</li>
          )}

          {!isLoading &&
            suggestions.map((node) => (
              <li key={node.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(node)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-body text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <span className="truncate">{node.name}</span>
                  <span className="shrink-0 font-mono text-small text-muted">
                    {node.type}
                  </span>
                </button>
              </li>
            ))}

          {!isLoading && showCreate && (
            <li role="option" aria-selected={false}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onCreate(trimmed)}
                className="flex w-full items-center gap-2 border-t border-border/30 px-3 py-2 text-left text-body text-accent transition-colors hover:bg-muted disabled:opacity-50"
              >
                Criar &ldquo;{trimmed}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
