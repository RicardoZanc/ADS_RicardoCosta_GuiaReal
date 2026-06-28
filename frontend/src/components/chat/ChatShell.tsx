"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ChatShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function ChatShell({ sidebar, children }: ChatShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {sidebar}
      <main className={cn("flex min-w-0 flex-1 flex-col")}>{children}</main>
    </div>
  );
}
