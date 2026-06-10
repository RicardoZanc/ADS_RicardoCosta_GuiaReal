import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { notifyApiError } from "@/lib/notifyApiError";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { NodeRecord, NodesListResponse, NodeType } from "@/lib/types/nodes";

interface UseNodeSearchParams {
  type: NodeType | null;
  tipoId?: string | null;
}

interface UseNodeSearchResult {
  query: string;
  setQuery: (value: string) => void;
  suggestions: NodeRecord[];
  isLoading: boolean;
  reset: () => void;
}

export function useNodeSearch({
  type,
  tipoId,
}: UseNodeSearchParams): UseNodeSearchResult {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NodeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounced = useDebouncedValue(query, 300);

  useEffect(() => {
    const trimmed = debounced.trim();

    if (!type || trimmed.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    const params: Record<string, string> = { q: trimmed, limit: "20" };
    if (type === "CATEGORIA" && tipoId) {
      params.tipo_id = tipoId;
    } else {
      params.type = type;
    }

    apiClient<NodesListResponse>("/nodes", { params })
      .then((response) => {
        if (active) {
          setSuggestions(response.data);
        }
      })
      .catch((error) => {
        if (active) {
          setSuggestions([]);
          notifyApiError(error);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [debounced, type, tipoId]);

  const reset = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  return { query, setQuery, suggestions, isLoading, reset };
}
