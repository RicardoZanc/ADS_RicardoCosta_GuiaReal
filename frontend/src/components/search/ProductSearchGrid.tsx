"use client";

import { AnimatePresence, motion } from "motion/react";
import { ProductSearchCard } from "@/components/search/ProductSearchCard";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { StaggerItem, StaggerList } from "@/components/motion/StaggerList";
import { easeOut, fadeInUp } from "@/lib/motion";
import type { ProductSearchItem } from "@/lib/types/search";

interface ProductSearchGridProps {
  products: ProductSearchItem[];
  emptyMessage: string;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
}

export function ProductSearchGrid({
  products,
  emptyMessage,
  showClearFilters = false,
  onClearFilters,
}: ProductSearchGridProps) {
  return (
    <AnimatePresence mode="wait">
      {products.length === 0 ? (
        <motion.div
          key="empty"
          className="w-full"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeInUp}
          transition={easeOut}
        >
          <SearchEmptyState
            message={emptyMessage}
            showClearFilters={showClearFilters}
            onClearFilters={onClearFilters}
          />
        </motion.div>
      ) : (
        <motion.div
          key="grid"
          className="w-full"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeInUp}
          transition={easeOut}
        >
          <StaggerList className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductSearchCard product={product} />
              </StaggerItem>
            ))}
          </StaggerList>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
