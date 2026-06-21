"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/feed/SearchModal";
import { logout } from "@/lib/auth";

interface AppHeaderProps {
  username: string;
}

export function AppHeader({ username }: AppHeaderProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-border/30 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/feed"
            className="font-mono text-small font-medium tracking-widest text-accent uppercase"
          >
            GuiaReal
          </Link>
          <span className="hidden text-body text-muted sm:inline">
            @{username}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-0 overflow-hidden p-0"
            onClick={() => setSearchOpen(true)}
          >
            <span className="flex items-center px-3 text-muted">Pesquisar</span>
            <span className="flex items-center rounded-l-lg  px-2.5">
              <SearchIcon />
            </span>
          </Button>
          <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
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
