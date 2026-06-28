"use client";

import { useTheme } from "next-themes";
import type { AppTheme } from "@/lib/theme";

export function useAppTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

  function setAppTheme(nextTheme: AppTheme) {
    setTheme(nextTheme);
  }

  function toggleTheme() {
    setAppTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return {
    theme: theme as AppTheme | undefined,
    resolvedTheme: resolvedTheme as AppTheme | undefined,
    systemTheme: systemTheme as AppTheme | undefined,
    setTheme: setAppTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light",
  };
}
