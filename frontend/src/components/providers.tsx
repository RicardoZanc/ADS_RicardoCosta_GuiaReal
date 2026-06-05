"use client";

import { ThemeProvider } from "next-themes";
import { AuthBootstrap } from "@/components/AuthBootstrap";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      enableColorScheme={false}
    >
      <AuthBootstrap />
      {children}
    </ThemeProvider>
  );
}
