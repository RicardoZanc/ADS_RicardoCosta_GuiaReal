import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { notifyApiError } from "@/lib/notifyApiError";
import { FACET_PAGE_LIMIT, fetchFacetSearch } from "@/lib/search";
import type { FeedPagination } from "@/lib/types/feed";
import type { FacetNode, FacetType } from "@/lib/types/search";

interface ScopeParams {
  tipo_id?: string;
  categoria_id?: string;
}

interface UseFacetFilterParams {
  facetType: FacetType;
  scopeParams: ScopeParams | null;
  resetKey?: number;
}

interface UseFacetFilterResult {
  query: string;
  setQuery: (value: string) => void;
  facets: FacetNode[];
  pagination: FeedPagination | null;
  isLoading: boolean;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  reset: () => void;
}

export function useFacetFilter({
  facetType,
  scopeParams,
  resetKey = 0,
}: UseFacetFilterParams): UseFacetFilterResult {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [facets, setFacets] = useState<FacetNode[]>([]);
  const [pagination, setPagination] = useState<FeedPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300);

  const reset = useCallback(() => {
    setQuery("");
    setPage(1);
    setFacets([]);
    setPagination(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reset();
  }, [scopeParams, resetKey, reset]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, scopeParams]);

  useEffect(() => {
    if (!scopeParams) {
      setFacets([]);
      setPagination(null);
      return;
    }

    let active = true;
    setIsLoading(true);

    fetchFacetSearch({
      ...scopeParams,
      facet_type: facetType,
      q: debouncedQuery.trim() || undefined,
      page,
      limit: FACET_PAGE_LIMIT,
    })
      .then((response) => {
        if (active) {
          setFacets(response.data);
          setPagination(response.pagination);
        }
      })
      .catch((error) => {
        if (active) {
          notifyApiError(error);
          setFacets([]);
          setPagination(null);
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
  }, [scopeParams, facetType, debouncedQuery, page]);

  const goToPreviousPage = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  return {
    query,
    setQuery,
    facets,
    pagination,
    isLoading,
    goToPreviousPage,
    goToNextPage,
    reset,
  };
}
