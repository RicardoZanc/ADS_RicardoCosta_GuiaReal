"use client";

import type { SelectedNode } from "@/lib/types/nodes";

interface NodeTagListProps {
  nodes: SelectedNode[];
  disabled?: boolean;
  onRemove: (id: string) => void;
}

export function NodeTagList({ nodes, disabled = false, onRemove }: NodeTagListProps) {
  if (nodes.length === 0) {
    return (
      <p className="text-small text-muted">Nenhum item adicionado (opcional).</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {nodes.map((node) => (
        <li
          key={node.id}
          className="flex items-center gap-2 rounded-full border border-border/40 bg-card px-3 py-1 text-small text-foreground"
        >
          <span className="max-w-[16rem] truncate">{node.name}</span>
          <button
            type="button"
            aria-label={`Remover ${node.name}`}
            disabled={disabled}
            onClick={() => onRemove(node.id)}
            className="text-muted transition-colors hover:text-foreground disabled:opacity-50"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
