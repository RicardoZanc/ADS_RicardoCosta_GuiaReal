"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import type { NodeRecord } from "@/lib/types/nodes";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isLoading, hasSearched, reset } =
    useGlobalSearch();

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open, reset]);

  function handleCreate() {
    onOpenChange(false);
    router.push("/create");
  }

  function handleSelect(node: NodeRecord) {
    onOpenChange(false);
    router.push(`/nodes/${node.id}`);
  }

  const trimmed = query.trim();
  const showResults = trimmed.length >= 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>Pesquisar</DialogTitle>
          <DialogDescription>
            Encontre tipos, categorias, marcas e outros tópicos da plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              ref={inputRef}
              type="search"
              value={query}
              placeholder="Buscar na plataforma…"
              autoComplete="off"
              className="pl-10"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="max-h-80 overflow-auto px-2 py-4">
          {!showResults ? (
            <p className="px-4 py-6 text-center text-body text-muted">
              Digite para começar a buscar.
            </p>
          ) : isLoading ? (
            <p className="px-4 py-6 text-center text-body text-muted">
              Buscando…
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-body text-muted">
              Nenhum resultado encontrado.
            </p>
          ) : (
            <ul className="divide-y divide-border/30">
              {results.map((node) => (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(node)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <span className="truncate text-body text-foreground">
                      {node.name}
                    </span>
                    <span className="shrink-0 font-mono text-small text-muted">
                      {node.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasSearched && !isLoading && (
          <div className="flex items-center justify-between gap-4 border-t border-border/30 px-6 py-4">
            <p className="text-body text-muted">
              Não encontrou o que você procura?
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleCreate}>
              Criar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
