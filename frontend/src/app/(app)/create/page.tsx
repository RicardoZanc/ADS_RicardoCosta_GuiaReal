"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateChoicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
        Criar
      </p>
      <h1 className="mt-2 font-sans text-h2 font-bold tracking-tight text-foreground">
        O que você quer adicionar?
      </h1>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
