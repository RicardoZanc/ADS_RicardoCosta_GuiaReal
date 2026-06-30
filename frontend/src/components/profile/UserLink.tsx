"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { AdminBadge } from "@/components/profile/AdminBadge";

interface UserLinkProps {
  username: string;
  isAdmin?: boolean;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Use when rendered inside another interactive container (e.g. feed card). */
  nested?: boolean;
}

const linkClassName =
  "inline-flex items-center gap-1 text-small text-muted transition-colors hover:text-accent";

function UsernameContent({
  username,
  isAdmin,
}: {
  username: string;
  isAdmin?: boolean;
}) {
  return (
    <>
      @{username}
      {isAdmin ? <AdminBadge /> : null}
    </>
  );
}

export function UserLink({
  username,
  isAdmin = false,
  className,
  onClick,
  nested = false,
}: UserLinkProps) {
  const router = useRouter();
  const href = `/users/${encodeURIComponent(username)}`;
  const classes = cn(linkClassName, className);

  function navigate(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event as MouseEvent<HTMLElement>);
    router.push(href);
  }

  if (nested) {
    return (
      <span
        role="link"
        tabIndex={0}
        className={cn(classes, "cursor-pointer")}
        onClick={navigate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            navigate(event);
          }
        }}
      >
        <UsernameContent username={username} isAdmin={isAdmin} />
      </span>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      <UsernameContent username={username} isAdmin={isAdmin} />
    </Link>
  );
}
