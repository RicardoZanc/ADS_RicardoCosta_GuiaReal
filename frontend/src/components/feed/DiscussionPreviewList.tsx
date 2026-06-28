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
      <p className="text-body text-muted italic">
        Nenhuma discussão ainda. Seja o primeiro a comentar.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {previews.map((preview) => (
        <li key={preview.id} className="border-l-2 border-accent/40 pl-3">
          <p className="text-body text-foreground">
            &ldquo;{truncateContent(preview.content)}&rdquo;
          </p>
          <p className="mt-1">
            <UserLink username={preview.author.username} nested />
          </p>
        </li>
      ))}
    </ul>
  );
}
