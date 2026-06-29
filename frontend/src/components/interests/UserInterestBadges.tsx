import { Tag } from "@/components/ui/tag";
import type { UserInterest } from "@/lib/types/users";

interface UserInterestBadgesProps {
  interests: UserInterest[];
}

export function UserInterestBadges({ interests }: UserInterestBadgesProps) {
  if (interests.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {interests.map((interest) => (
        <Tag key={interest.id} variant="accent">
          {interest.name}
        </Tag>
      ))}
    </div>
  );
}
