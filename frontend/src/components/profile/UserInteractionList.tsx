"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { UserInteraction } from "@/lib/types/users";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

const PREVIEW_MAX_LENGTH = 120;

function truncateContent(content: string): string {
  if (content.length <= PREVIEW_MAX_LENGTH) return content;
  return `${content.slice(0, PREVIEW_MAX_LENGTH).trimEnd()}…`;
}

function getInteractionHref(interaction: UserInteraction): string {
  return interaction.context.kind === "product"
    ? `/products/${interaction.context.id}`
    : `/nodes/${interaction.context.id}`;
}

interface UserInteractionListProps {
  interactions: UserInteraction[];
}

function InteractionRow({ interaction }: { interaction: UserInteraction }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div whileHover={prefersReducedMotion ? undefined : { x: 4 }}>
      <Link
        href={getInteractionHref(interaction)}
        className="block rounded-xl border border-border/15 bg-card/50 px-4 py-4 transition-colors hover:border-accent/20 hover:bg-card hover:shadow-[var(--shadow-card)] lg:px-5 lg:py-5"
      >
        <p className="text-product-name text-foreground transition-colors hover:text-accent">
          {interaction.context.name}
        </p>
        <p className="text-comment mt-2 text-muted lg:mt-1.5">
          {truncateContent(interaction.content)}
        </p>
      </Link>
    </motion.div>
  );
}

export function UserInteractionList({ interactions }: UserInteractionListProps) {
  if (interactions.length === 0) {
    return (
      <p className="text-body text-muted italic">
        Nenhuma interação registrada ainda.
      </p>
    );
  }

  return (
    <StaggerList className="flex flex-col gap-3">
      {interactions.map((interaction) => (
        <StaggerItem key={`${interaction.kind}-${interaction.id}`}>
          <InteractionRow interaction={interaction} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
