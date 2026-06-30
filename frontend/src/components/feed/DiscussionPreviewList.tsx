import type { FeedDiscussionPreview } from "@/lib/types/feed";
import { UserLink } from "@/components/profile/UserLink";

const PREVIEW_MAX_LENGTH = 120;

function truncateContent(content: string): string {
  if (content.length <= PREVIEW_MAX_LENGTH) return content;
  return `${content.slice(0, PREVIEW_MAX_LENGTH).trimEnd()}…`;
}

interface DiscussionPreviewListProps {
  previews: FeedDiscussionPreview[];
}

export function DiscussionPreviewList({ previews }: DiscussionPreviewListProps) {
  if (previews.length === 0) {
    return (
      <p className="text-comment text-muted">
        Nenhuma discussão ainda. Seja o primeiro a comentar.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {previews.map((preview) => (
        <li
          key={preview.id}
          className="rounded-lg bg-muted/5 px-3 py-2.5"
        >
          <p className="text-comment text-foreground/85">
            {truncateContent(preview.content)}
          </p>
          <p className="mt-1.5">
            <UserLink
              username={preview.author.username}
              isAdmin={preview.author.is_admin}
              nested
            />
          </p>
        </li>
      ))}
    </ul>
  );
}
