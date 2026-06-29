"use client";

import {
  selectIsAuthenticated,
  useAuthStore,
} from "@/store/authStore";
import { AppHeader } from "@/components/feed/AppHeader";
import { PublicHeader } from "@/components/feed/PublicHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="skeleton-shimmer h-8 w-32 rounded-lg" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {isAuthenticated && user ? (
        <AppHeader username={user.username} isAdmin={user.is_admin} />
      ) : (
        <PublicHeader />
      )}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
