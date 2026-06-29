"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useInterestOptions } from "@/hooks/useInterestOptions";
import { notifyApiError } from "@/lib/notifyApiError";
import { replaceMyInterests } from "@/lib/users";
import type { UserInterest } from "@/lib/types/users";
import { InterestPicker } from "./InterestPicker";

interface InterestPickerDialogProps {
  initialInterests: UserInterest[];
  onSaved: (interests: UserInterest[]) => void;
}

export function InterestPickerDialog({
  initialInterests,
  onSaved,
}: InterestPickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const { filteredOptions, query, setQuery, isLoading } = useInterestOptions({
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(initialInterests.map((interest) => interest.id)));
      setQuery("");
    }
  }, [open, initialInterests, setQuery]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      const interests = await replaceMyInterests([...selectedIds]);
      onSaved(interests);
      setOpen(false);
    } catch (error) {
      if (notifyApiError(error)) return;
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          Editar interesses
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seus interesses</DialogTitle>
          <DialogDescription>
            Escolha os tipos e categorias que mais combinam com você.
          </DialogDescription>
        </DialogHeader>

        <InterestPicker
          options={filteredOptions}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          isLoading={isLoading}
          query={query}
          onQueryChange={setQuery}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} loading={isSaving}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
