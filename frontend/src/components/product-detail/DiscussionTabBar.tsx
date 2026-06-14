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
      className="flex flex-wrap gap-2 border-b border-border/30 pb-3"
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
              "border px-3 py-1.5 font-mono text-small transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border/30 text-muted hover:border-accent/40 hover:text-foreground"
            )}
          >
            {tab.label}
            <span className="ml-2 text-muted">({tab.opinionCount})</span>
          </button>
        );
      })}
    </div>
  );
}
