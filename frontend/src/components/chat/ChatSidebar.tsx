"use client";

import Link from "next/link";
import {
  MessageSquarePlusIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatSummary } from "@/lib/types/chats";

const SIDEBAR_COLLAPSED_KEY = "chat-sidebar-collapsed";

export function getSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

export function setSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
}

interface ChatSidebarProps {
  chats: ChatSummary[];
  activeChatId?: string;
  isCollapsed: boolean;
  isLoading: boolean;
  onToggleCollapse: () => void;
}

function getChatLabel(chat: ChatSummary): string {
  return chat.title?.trim() || "Nova conversa";
}

export function ChatSidebar({
  chats,
  activeChatId,
  isCollapsed,
  isLoading,
  onToggleCollapse,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        isCollapsed ? "w-12" : "w-[260px]"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b border-sidebar-border p-2",
          isCollapsed ? "justify-center" : "justify-between px-3"
        )}
      >
        {!isCollapsed && (
          <Link
            href="/feed"
            className="font-mono text-small tracking-widest text-muted uppercase hover:text-accent"
          >
            ← Feed
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expandir sidebar" : "Retrair sidebar"}
        >
          {isCollapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </Button>
      </div>

      <div className="p-2">
        <Button
          asChild
          variant="outline"
          size={isCollapsed ? "icon-sm" : "sm"}
          className={cn(
            "w-full border-sidebar-border bg-transparent hover:bg-sidebar-accent",
            !isCollapsed && "justify-start gap-2"
          )}
        >
          <Link href="/chat" title="Novo chat">
            <MessageSquarePlusIcon />
            {!isCollapsed && <span>Novo chat</span>}
          </Link>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {!isCollapsed && (
          <p className="mb-2 px-2 font-mono text-small tracking-widest text-muted uppercase">
            Conversas
          </p>
        )}

        {isLoading && !isCollapsed && (
          <div className="space-y-2 px-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-9 animate-pulse rounded-lg bg-sidebar-accent/60"
              />
            ))}
          </div>
        )}

        {!isLoading && chats.length === 0 && !isCollapsed && (
          <p className="px-2 text-small text-muted">Nenhuma conversa ainda.</p>
        )}

        <ul className="space-y-1">
          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const label = getChatLabel(chat);

            return (
              <li key={chat.id}>
                <Link
                  href={`/chat/${chat.id}`}
                  title={label}
                  className={cn(
                    "flex items-center rounded-lg px-2 py-2 text-body transition-colors hover:bg-sidebar-accent",
                    isActive &&
                      "bg-sidebar-accent text-accent ring-1 ring-accent/30",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  {isCollapsed ? (
                    <span className="font-mono text-small">
                      {label.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <span className="truncate">{label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
