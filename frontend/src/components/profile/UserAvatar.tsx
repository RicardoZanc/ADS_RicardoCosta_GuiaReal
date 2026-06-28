import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "md" | "lg";
  className?: string;
}

const sizeClasses = {
  md: "size-24 text-h4",
  lg: "size-40 text-h2 lg:size-48",
} as const;

export function UserAvatar({
  username,
  avatarUrl,
  size = "lg",
  className,
}: UserAvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={`Avatar de ${username}`}
        className={cn(
          "shrink-0 rounded-2xl border border-border/15 object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl",
        "border border-border/15 bg-muted/10 text-muted",
        sizeClasses[size],
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
