"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SelectedNode } from "@/lib/types/nodes";

interface SelectedNodeCardProps {
  node: SelectedNode;
  disabled?: boolean;
  onRename: (newName: string) => void;
  onSwap: () => void;
}

export function SelectedNodeCard({
  node,
  disabled = false,
  onRename,
  onSwap,
}: SelectedNodeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(node.name);

  function startEditing() {
    setDraftName(node.name);
    setIsEditing(true);
  }

  function confirmRename() {
    const trimmed = draftName.trim();
    if (trimmed.length === 0 || trimmed === node.name) {
      setIsEditing(false);
      return;
    }
    onRename(trimmed);
    setIsEditing(false);
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <Input
            type="text"
            autoFocus
            value={draftName}
            disabled={disabled}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                confirmRename();
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              loading={disabled}
              onClick={confirmRename}
            >
              Salvar nome
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-body font-medium text-foreground">
              {node.name}
            </p>
            <p className="font-mono text-small text-muted">{node.type}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={startEditing}
            >
              Renomear
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={onSwap}
            >
              Trocar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
