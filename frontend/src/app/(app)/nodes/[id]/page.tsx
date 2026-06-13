"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NodeDetailPlaceholderPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
        Nó
      </p>
      <h1 className="mt-2 font-sans text-h2 font-bold text-foreground">
        Detalhe em breve
      </h1>
      <p className="mt-4 text-body text-muted">
        A página completa do nó ainda está em desenvolvimento.
        {id ? (
          <>
            {" "}
            Identificador:{" "}
            <span className="font-mono text-small text-foreground">{id}</span>
          </>
        ) : null}
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/feed">Voltar ao feed</Link>
      </Button>
    </div>
  );
}
