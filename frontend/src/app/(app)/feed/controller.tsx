"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSimplifiedFeed } from "@/lib/feed";
import { notifyApiError } from "@/lib/notifyApiError";
import type { FeedItem } from "@/lib/types/feed";

type SimplifiedFeedState = {
  community: FeedItem[];
  interests: FeedItem[];
  new: FeedItem[];
};

const EMPTY_FEED: SimplifiedFeedState = {
  community: [],
  interests: [],
  new: [],
};

export function useFeedController() {
  const [feed, setFeed] = useState<SimplifiedFeedState>(EMPTY_FEED);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchSimplifiedFeed();
      setFeed(response);
    } catch (error) {
      notifyApiError(error);
      setFeed(EMPTY_FEED);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  return {
    feed,
    isLoading,
  };
}
