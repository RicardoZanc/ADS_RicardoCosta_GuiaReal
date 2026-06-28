"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function CreateChoicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Criar"
        title="O que você quer adicionar?"
        className="mb-8"
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href="/nodes/new">Tópico</Link>
        </Button>
        <Button asChild size="lg" className="flex-1">
          <Link href="/products/new">Produto</Link>
        </Button>
      </div>
    </div>
  );
}
