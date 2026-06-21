"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AppHeader } from "@/components/feed/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated, user } = useRequireAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="font-mono text-small text-muted">Carregando…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader username={user.username} />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
