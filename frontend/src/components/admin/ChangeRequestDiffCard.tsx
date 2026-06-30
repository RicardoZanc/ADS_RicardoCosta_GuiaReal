import Link from "next/link";
import type { ChangeRequestItem } from "@/lib/types/changeRequests";
import { UserLink } from "@/components/profile/UserLink";

interface ChangeRequestDiffCardProps {
  request: ChangeRequestItem;
}

function entityHref(request: ChangeRequestItem): string {
  if (request.entity_type === "NODE") {
    return `/nodes/${request.entity_id}`;
  }

  return `/products/${request.entity_id}`;
}

export function ChangeRequestDiffCard({ request }: ChangeRequestDiffCardProps) {
  return (
    <div className="space-y-4">
      <p className="text-body text-foreground">
        <UserLink username={request.user.username} /> solicita mudança em{" "}
        <Link
          href={entityHref(request)}
          className="font-medium text-accent hover:underline"
        >
          {request.entity_label}
        </Link>
      </p>

      {request.diff.length > 0 ? (
        <ul className="space-y-2 rounded-xl border border-border/15 bg-muted/5 p-4">
          {request.diff.map((entry) => (
            <li key={entry.field} className="text-comment text-foreground">
              <span className="font-medium">{entry.label}:</span>{" "}
              <span className="text-muted">{entry.from}</span>
              {" → "}
              <span>{entry.to}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-comment text-muted">Sem detalhes de comparação.</p>
      )}
    </div>
  );
}
