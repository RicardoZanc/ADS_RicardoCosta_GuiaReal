"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchFeedPage } from "@/lib/feed";
import { notifyApiError } from "@/lib/notifyApiError";
import type { FeedItem } from "@/lib/types/feed";

export function useFeedController() {
  const [items, setItems] = useState<FeedItem[]>([]);
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

    try {
      const response = await fetchFeedPage(targetPage);
      setItems((prev) =>
        append ? [...prev, ...response.data] : response.data
      );
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      notifyApiError(error);
      if (!append) {
        setItems([]);
      }
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
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
