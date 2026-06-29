"use client";

import { InterestPill } from "@/components/interests/InterestPill";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { FacetNode } from "@/lib/types/search";

interface FacetSectionProps {
  title: string;
  facets: FacetNode[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function FacetSection({
  title,
  facets,
  selectedIds,
  onToggle,
}: FacetSectionProps) {
  if (facets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <Eyebrow>{title}</Eyebrow>
      <div className="flex flex-wrap gap-2.5">
        {facets.map((facet) => (
          <InterestPill
            key={facet.id}
            label={`${facet.name} (${facet.productCount})`}
            selected={selectedIds.has(facet.id)}
            onToggle={() => onToggle(facet.id)}
          />
        ))}
      </div>
    </section>
  );
}
