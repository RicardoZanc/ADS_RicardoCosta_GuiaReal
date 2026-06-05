"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  selectIsAuthenticated,
  useAuthStore,
} from "@/store/authStore";

export function HomeAuthRedirect() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    router.replace("/feed");
  }, [isHydrated, isAuthenticated, router]);

  return null;
}
