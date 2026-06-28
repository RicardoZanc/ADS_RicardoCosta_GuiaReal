"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useAppTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn(className)}
      aria-label={
        mounted
          ? isDark
            ? "Ativar tema claro"
            : "Ativar tema escuro"
          : "Alternar tema"
      }
      disabled={!mounted}
      onClick={toggleTheme}
    >
      {mounted ? (
        isDark ? (
          <SunIcon className="size-4" />
        ) : (
          <MoonIcon className="size-4" />
        )
      ) : (
        <SunIcon className="size-4 opacity-0" aria-hidden />
      )}
    </Button>
  );
}
