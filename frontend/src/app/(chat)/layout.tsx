"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady, isAuthenticated } = useRequireAuth();

  if (!isReady) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="skeleton-shimmer h-8 w-32 rounded-lg" aria-hidden />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div className="h-dvh overflow-hidden">{children}</div>;
}
