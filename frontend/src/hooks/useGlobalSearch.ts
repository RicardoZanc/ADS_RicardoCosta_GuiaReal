import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { notifyApiError } from "@/lib/notifyApiError";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { NodeRecord, NodesListResponse } from "@/lib/types/nodes";

interface UseGlobalSearchResult {
  query: string;
  setQuery: (value: string) => void;
  results: NodeRecord[];
  isLoading: boolean;
  hasSearched: boolean;
  reset: () => void;
}

export function useGlobalSearch(): UseGlobalSearchResult {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NodeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debounced = useDebouncedValue(query, 300);

  useEffect(() => {
    const trimmed = debounced.trim();

    if (trimmed.length < 1) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    apiClient<NodesListResponse>("/nodes", {
      params: { q: trimmed, limit: "20" },
    })
      .then((response) => {
        if (active) {
          setResults(response.data);
        }
      })
      .catch((error) => {
        if (active) {
          setResults([]);
          notifyApiError(error);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
          if (trimmed.length >= 1) {
            setHasSearched(true);
          }
        }
      });

    return () => {
      active = false;
    };
  }, [debounced]);

  const reset = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsLoading(false);
    setHasSearched(false);
  }, []);

  return { query, setQuery, results, isLoading, hasSearched, reset };
}
