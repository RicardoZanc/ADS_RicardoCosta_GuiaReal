"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AppHeader } from "@/components/feed/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated, user } = useRequireAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="skeleton-shimmer h-8 w-32 rounded-lg" aria-hidden />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader username={user.username} isAdmin={user.is_admin} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
