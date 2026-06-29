"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export function useRequireAdmin() {
  const router = useRouter();
  const auth = useRequireAuth();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!auth.isReady || !auth.isAuthenticated) return;
    if (!user?.is_admin) {
      router.replace("/feed");
    }
  }, [auth.isReady, auth.isAuthenticated, user?.is_admin, router]);

  return {
    ...auth,
    isAdmin: Boolean(user?.is_admin),
  };
}
