import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api";
import { notifyApiError } from "@/lib/notifyApiError";
import type { NodeRecord, NodesListResponse } from "@/lib/types/nodes";

export type InterestOption = {
  id: string;
  name: string;
  type: "TIPO" | "CATEGORIA";
  parent_id: string | null;
};

function sortInterestOptions(options: InterestOption[]): InterestOption[] {
  return [...options].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "TIPO" ? -1 : 1;
    }
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

function toInterestOption(node: NodeRecord): InterestOption {
  return {
    id: node.id,
    name: node.name,
    type: node.type as "TIPO" | "CATEGORIA",
    parent_id: node.parent_id,
  };
}

interface UseInterestOptionsParams {
  enabled?: boolean;
}

interface UseInterestOptionsResult {
  options: InterestOption[];
  filteredOptions: InterestOption[];
  query: string;
  setQuery: (value: string) => void;
  isLoading: boolean;
}

export function useInterestOptions({
  enabled = true,
}: UseInterestOptionsParams = {}): UseInterestOptionsResult {
  const [options, setOptions] = useState<InterestOption[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;
    setIsLoading(true);

    Promise.all([
      apiClient<NodesListResponse>("/nodes", {
        params: { type: "TIPO", limit: "100" },
      }),
      apiClient<NodesListResponse>("/nodes", {
        params: { type: "CATEGORIA", limit: "100" },
      }),
    ])
      .then(([tipos, categorias]) => {
        if (!active) return;
        const merged = sortInterestOptions([
          ...tipos.data.map(toInterestOption),
          ...categorias.data.map(toInterestOption),
        ]);
        setOptions(merged);
      })
      .catch((error) => {
        if (!active) return;
        setOptions([]);
        notifyApiError(error);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return options;
    }
    return options.filter((option) =>
      option.name.toLowerCase().includes(trimmed)
    );
  }, [options, query]);

  return {
    options,
    filteredOptions,
    query,
    setQuery,
    isLoading,
  };
}
