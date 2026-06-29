import Link from "next/link";
import { HomeAuthRedirect } from "@/components/HomeAuthRedirect";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-20">
      <HomeAuthRedirect />
      <FadeIn className="w-full max-w-2xl space-y-10">
        <PageHeader
          centered
          eyebrow="GuiaReal"
          title="Decisões de compra com IA e a sabedoria da comunidade."
          description="Avalie produtos, leia experiências reais e deixe a inteligência artificial ajudar você a escolher com mais contexto."
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="flex-1">
            <Link href="/register">Criar conta</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>

        <div className="text-center">
          <Link
            href="/feed"
            className="text-body font-medium text-accent hover:text-accent/80"
          >
            Explorar sem conta
          </Link>
        </div>
      </FadeIn>
    </main>
  );
}
