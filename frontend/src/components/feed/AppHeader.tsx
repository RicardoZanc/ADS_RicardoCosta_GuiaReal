"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

interface AppHeaderProps {
  username: string;
}

export function AppHeader({ username }: AppHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-border/30 bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/feed"
          className="font-mono text-small font-medium tracking-widest text-accent uppercase"
        >
          GuiaReal
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden text-body text-muted sm:inline">
            @{username}
          </span>
          <Button asChild variant="default" size="sm">
            <Link href="/products/new">Cadastrar produto</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
