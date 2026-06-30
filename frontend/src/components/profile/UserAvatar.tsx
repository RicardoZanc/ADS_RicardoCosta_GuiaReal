import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-[10px] rounded-lg",
  md: "size-24 text-h4 rounded-2xl",
  lg: "size-40 text-h2 lg:size-48 rounded-2xl",
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
          "shrink-0 border border-border/15 object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
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
