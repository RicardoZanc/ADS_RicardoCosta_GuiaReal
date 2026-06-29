"use client";

import {
  selectIsAuthenticated,
  useAuthStore,
} from "@/store/authStore";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  if (!isHydrated) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="skeleton-shimmer h-8 w-32 rounded-lg" aria-hidden />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative h-dvh overflow-hidden">
        <div className="pointer-events-none h-full select-none blur-sm">
          {children}
        </div>
        <AuthPromptModal
          open
          onOpenChange={() => {
            if (typeof window === "undefined") return;
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = "/feed";
            }
          }}
          reason="Crie uma conta para conversar com o assistente e tirar dúvidas sobre produtos com IA."
          overlayClassName="backdrop-blur-md"
        />
      </div>
    );
  }

  return <div className="h-dvh overflow-hidden">{children}</div>;
}
