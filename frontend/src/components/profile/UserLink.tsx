"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface UserLinkProps {
  username: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Use when rendered inside another interactive container (e.g. feed card). */
  nested?: boolean;
}

const linkClassName =
  "font-mono text-small text-muted transition-colors hover:text-accent";

export function UserLink({
  username,
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
        @{username}
      </span>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      @{username}
    </Link>
  );
}
