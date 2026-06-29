"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/feed/SearchModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthGate } from "@/hooks/useAuthGate";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/feed"
      ? pathname === "/feed" || pathname.startsWith("/products") || pathname.startsWith("/nodes")
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
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

export function PublicHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { openAuthPrompt } = useAuthGate();

  function handleAssistantClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    openAuthPrompt(
      "Crie uma conta para conversar com o assistente e tirar dúvidas sobre produtos com IA."
    );
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
            <NavLink href="/chat" onClick={handleAssistantClick}>
              Assistente
            </NavLink>
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
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Criar conta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
