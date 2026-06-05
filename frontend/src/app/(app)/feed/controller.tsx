"use client";

import { useCallback, useEffect, useState } from "react";
import { getMockFeedPage } from "@/lib/mocks/feed";
import type { FeedProduct } from "@/lib/types/feed";

const MOCK_LOAD_DELAY_MS = 300;

export function useFeedController() {
  const [items, setItems] = useState<FeedProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPage = useCallback(async (targetPage: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    await new Promise((resolve) => setTimeout(resolve, MOCK_LOAD_DELAY_MS));

    const response = getMockFeedPage(targetPage);
    setItems((prev) =>
      append ? [...prev, ...response.data] : response.data
    );
    setPage(response.pagination.page);
    setTotalPages(response.pagination.totalPages);

    if (append) {
      setIsLoadingMore(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const hasMore = page < totalPages;

  function loadMore() {
    if (!hasMore || isLoadingMore || isLoading) return;
    void loadPage(page + 1, true);
  }

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  };
}
