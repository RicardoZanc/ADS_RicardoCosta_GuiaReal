"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady, isAuthenticated, user } = useRequireAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="skeleton-shimmer h-8 w-32 rounded-lg" aria-hidden />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return children;
}
