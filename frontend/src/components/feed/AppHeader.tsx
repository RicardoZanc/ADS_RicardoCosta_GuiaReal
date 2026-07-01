"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/feed/SearchModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  username: string;
  isAdmin?: boolean;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/feed"
      ? pathname === "/feed" || pathname.startsWith("/products") || pathname.startsWith("/nodes")
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "relative text-small font-medium transition-colors",
        isActive ? "text-accent" : "text-muted hover:text-foreground",
        className
      )}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-accent"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function AppHeader({ username, isAdmin = false }: AppHeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const profilePath = `/users/${encodeURIComponent(username)}`;
  const isProfileActive =
    pathname === profilePath || pathname.startsWith(`${profilePath}/`);

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/15 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/feed"
            className="text-small font-semibold text-accent transition-opacity hover:opacity-80"
          >
            GuiaReal
          </Link>
          <nav className="hidden items-center gap-5 sm:flex">
            <NavLink href="/feed">Feed</NavLink>
            <NavLink href="/busca">Busca</NavLink>
            <NavLink href="/chat">Assistente</NavLink>
            {isAdmin ? (
              <NavLink href="/admin/reports">Moderação</NavLink>
            ) : null}
            <Link
              href={profilePath}
              className={cn(
                "relative text-small font-medium transition-colors",
                isProfileActive
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              )}
            >
              @{username}
              {isProfileActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 overflow-hidden px-3 transition-colors"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="size-4 text-muted transition-colors group-hover/button:text-accent" />
            <span className="hidden text-muted sm:inline">Pesquisar</span>
          </Button>
          <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
