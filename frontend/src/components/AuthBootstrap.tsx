"use client";

import { useEffect } from "react";
import { refreshSession } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function AuthBootstrap() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    if (isHydrated) return;

    async function hydrate() {
      if (!accessToken) {
        const data = await refreshSession();
        if (data) {
          setAuth(data.accessToken, data.user);
        }
      }
      setHydrated(true);
    }

    void hydrate();
  }, [isHydrated, accessToken, setAuth, setHydrated]);

  return null;
}
