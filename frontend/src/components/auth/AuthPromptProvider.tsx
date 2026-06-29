"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";
import {
  selectIsAuthenticated,
  useAuthStore,
} from "@/store/authStore";

interface AuthPromptContextValue {
  openAuthPrompt: (reason?: string) => void;
  requireAuth: (reason?: string) => boolean;
}

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const openAuthPrompt = useCallback((nextReason?: string) => {
    setReason(nextReason);
    setOpen(true);
  }, []);

  const requireAuth = useCallback(
    (nextReason?: string) => {
      if (isAuthenticated) {
        return true;
      }

      openAuthPrompt(nextReason);
      return false;
    },
    [isAuthenticated, openAuthPrompt]
  );

  const value = useMemo(
    () => ({ openAuthPrompt, requireAuth }),
    [openAuthPrompt, requireAuth]
  );

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AuthPromptModal
        open={open}
        onOpenChange={setOpen}
        reason={reason}
      />
    </AuthPromptContext.Provider>
  );
}

export function useAuthGate() {
  const context = useContext(AuthPromptContext);

  if (!context) {
    throw new Error("useAuthGate must be used within AuthPromptProvider");
  }

  return context;
}
