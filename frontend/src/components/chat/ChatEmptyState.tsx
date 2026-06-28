"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { Eyebrow } from "@/components/ui/eyebrow";

export function ChatEmptyState() {
  return (
    <FadeIn className="flex flex-1 flex-col items-center justify-center px-4">
      <Eyebrow>Assistente</Eyebrow>
      <h1 className="mt-4 font-sans text-h3 font-semibold leading-snug text-foreground">
        Como posso ajudar?
      </h1>
      <p className="mt-2 max-w-md text-center text-comment text-muted">
        Pergunte sobre produtos, opiniões da comunidade e fatos técnicos do
        GuiaReal.
      </p>
    </FadeIn>
  );
}
