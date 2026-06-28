"use client";

import { motion } from "motion/react";
import type { ProductDiscussionTab } from "@/lib/types/products";
import { cn } from "@/lib/utils";

interface DiscussionTabBarProps {
  tabs: ProductDiscussionTab[];
  activeTabIndex: number;
  disabled?: boolean;
  onSelectTab: (index: number) => void;
}

export function DiscussionTabBar({
  tabs,
  activeTabIndex,
  disabled = false,
  onSelectTab,
}: DiscussionTabBarProps) {
  if (tabs.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-2 border-b border-border/15 pb-3"
      role="tablist"
      aria-label="Abas de discussão"
    >
      {tabs.map((tab, index) => {
        const isActive = index === activeTabIndex;

        return (
          <button
            key={
              tab.scope === "product"
                ? "product"
                : `${tab.nodeId}-${tab.type}`
            }
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onSelectTab(index)}
            className={cn(
              "relative rounded-full px-3 py-1.5 text-small font-medium transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? "text-accent"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-muted">({tab.opinionCount})</span>
            {isActive && (
              <motion.span
                layoutId="discussion-tab-indicator"
                className="absolute inset-0 -z-10 rounded-full bg-accent/10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
