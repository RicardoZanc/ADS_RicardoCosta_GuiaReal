"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAuthStore, selectIsAuthenticated } from "@/store/authStore";

interface EntityEditButtonProps {
  href: string;
  label?: string;
}

export function EntityEditButton({
  href,
  label = "Editar",
}: EntityEditButtonProps) {
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  function handleClick() {
    if (!requireAuth()) return;
    router.push(href);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick}>
      {label}
    </Button>
  );
}
