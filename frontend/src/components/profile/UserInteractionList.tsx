import Link from "next/link";
import type { UserInteraction } from "@/lib/types/users";

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

export function UserInteractionList({ interactions }: UserInteractionListProps) {
  if (interactions.length === 0) {
    return (
      <p className="text-body text-muted italic">
        Nenhuma interação registrada ainda.
      </p>
    );
  }

  return (
    <div className="border border-border/30">
      <div className="hidden border-b border-border/30 bg-muted/10 px-5 py-3 lg:grid lg:grid-cols-[minmax(14rem,22rem)_minmax(0,1fr)] lg:gap-8">
        <span className="font-mono text-small font-medium tracking-wide text-muted uppercase">
          Tópico
        </span>
        <span className="font-mono text-small font-medium tracking-wide text-muted uppercase">
          Comentário
        </span>
      </div>

      <ul className="divide-y divide-border/30">
        {interactions.map((interaction) => (
          <li key={`${interaction.kind}-${interaction.id}`}>
            <Link
              href={getInteractionHref(interaction)}
              className="block px-4 py-4 transition-colors hover:bg-muted/10 lg:grid lg:grid-cols-[minmax(14rem,22rem)_minmax(0,1fr)] lg:items-start lg:gap-8 lg:px-5 lg:py-5"
            >
              <p className="font-sans text-h4 text-foreground hover:text-accent">
                {interaction.context.name}
              </p>
              <p className="mt-2 text-body text-foreground lg:mt-0">
                {truncateContent(interaction.content)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
