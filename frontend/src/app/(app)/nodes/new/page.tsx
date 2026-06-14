"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NodeCreatePlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
        Tópico
      </p>
      <h1 className="mt-2 font-sans text-h2 font-bold text-foreground">
        Cadastro em breve
      </h1>
      <p className="mt-4 text-body text-muted">
        A criação de tópicos ainda está em desenvolvimento.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/feed">Voltar ao feed</Link>
      </Button>
    </div>
  );
}
