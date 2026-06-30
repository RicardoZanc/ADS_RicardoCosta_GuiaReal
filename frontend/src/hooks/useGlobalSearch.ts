import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { notifyApiError } from "@/lib/notifyApiError";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { NodeRecord } from "@/lib/types/nodes";
import type { GlobalSearchResponse, ProductSearchItem } from "@/lib/types/search";

interface UseGlobalSearchResult {
  query: string;
  setQuery: (value: string) => void;
  nodeResults: NodeRecord[];
  productResults: ProductSearchItem[];
  isLoading: boolean;
  hasSearched: boolean;
  reset: () => void;
}

export function useGlobalSearch(): UseGlobalSearchResult {
  const [query, setQuery] = useState("");
  const [nodeResults, setNodeResults] = useState<NodeRecord[]>([]);
  const [productResults, setProductResults] = useState<ProductSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debounced = useDebouncedValue(query, 300);

  useEffect(() => {
    const trimmed = debounced.trim();

    if (trimmed.length < 1) {
      setNodeResults([]);
      setProductResults([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    apiClient<GlobalSearchResponse>("/search", {
      params: { q: trimmed, limit_nodes: "20", limit_products: "10" },
    })
      .then((response) => {
        if (active) {
          setNodeResults(response.nodes.data);
          setProductResults(response.products.data);
        }
      })
      .catch((error) => {
        if (active) {
          setNodeResults([]);
          setProductResults([]);
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
    setNodeResults([]);
    setProductResults([]);
    setIsLoading(false);
    setHasSearched(false);
  }, []);

  return {
    query,
    setQuery,
    nodeResults,
    productResults,
    isLoading,
    hasSearched,
    reset,
  };
}
