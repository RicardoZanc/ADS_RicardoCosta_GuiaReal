"use client";

import { ThemeProvider } from "next-themes";
import { AuthBootstrap } from "@/components/AuthBootstrap";
import { AuthPromptProvider } from "@/components/auth/AuthPromptProvider";
import { APP_THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={DEFAULT_THEME}
      themes={[...APP_THEMES]}
      storageKey={THEME_STORAGE_KEY}
      enableSystem={false}
      enableColorScheme
    >
      <AuthBootstrap />
      <AuthPromptProvider>{children}</AuthPromptProvider>
    </ThemeProvider>
  );
}
