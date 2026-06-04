import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-2xl space-y-12">
        <header className="space-y-4">
          <p className="font-mono text-small font-medium tracking-widest text-accent uppercase">
            GuiaReal
          </p>
          <h1 className="font-sans text-h1 font-bold leading-none tracking-tight text-foreground">
            Decisões de compra com IA e a sabedoria da comunidade.
          </h1>
          <p className="text-body text-muted max-w-lg">
            Avalie produtos, leia experiências reais e deixe a inteligência
            artificial ajudar você a escolher com mais contexto.
          </p>
        </header>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center justify-center border border-accent bg-accent/10 px-6 py-3 font-mono text-small font-semibold uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center border border-border px-6 py-3 font-mono text-small font-semibold uppercase tracking-widest text-muted transition-colors hover:border-foreground hover:text-foreground"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
