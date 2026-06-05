import { create } from "zustand";
import type { AuthUser } from "@/lib/types/auth";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrated: boolean;

  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  setHydrated: (value: boolean) => void;
  clearAuth: () => void;
}

export function selectIsAuthenticated(state: AuthState): boolean {
  return state.accessToken !== null && state.user !== null;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,

  setAuth: (accessToken, user) => set({ accessToken, user }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setHydrated: (isHydrated) => set({ isHydrated }),

  clearAuth: () => set({ accessToken: null, user: null }),
}));
