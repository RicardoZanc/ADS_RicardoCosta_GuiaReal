"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  selectIsAuthenticated,
  useAuthStore,
} from "@/store/authStore";

export function useRequireAuth() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  return {
    isReady: isHydrated,
    isAuthenticated: isHydrated && isAuthenticated,
    user,
  };
}
