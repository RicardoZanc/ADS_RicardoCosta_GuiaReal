"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/ui/section-header";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { cn } from "@/lib/utils";

const ADMIN_TABS = [
  { href: "/admin/reports", label: "Denúncias" },
  { href: "/admin/requests", label: "Solicitações de admin" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isReady, isAdmin } = useRequireAdmin();

  if (!isReady || !isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="skeleton-shimmer h-8 w-32 rounded-lg" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <SectionHeader
        eyebrow="Administração"
        title="Moderação"
        description="Gerencie denúncias e solicitações de administrador da comunidade."
      />

      <nav
        className="mt-6 flex flex-wrap gap-2 border-b border-border/15 pb-3"
        role="tablist"
        aria-label="Seções de moderação"
      >
        {ADMIN_TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-small font-medium transition-colors",
                isActive
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              )}
            >
              {tab.label}
              {isActive ? (
                <motion.span
                  layoutId="admin-tab-indicator"
                  className="absolute inset-0 -z-10 rounded-full bg-accent/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
