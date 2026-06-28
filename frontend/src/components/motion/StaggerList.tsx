"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import {
  reducedMotionContainer,
  reducedMotionVariants,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

type StaggerListProps = HTMLMotionProps<"div">;

export function StaggerList({
  className,
  children,
  ...props
}: StaggerListProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={prefersReducedMotion ? reducedMotionContainer : staggerContainer}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = HTMLMotionProps<"div">;

export function StaggerItem({
  className,
  children,
  ...props
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? reducedMotionVariants : staggerItem}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerListItemProps = HTMLMotionProps<"li">;

export function StaggerListItem({
  className,
  children,
  ...props
}: StaggerListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.li
      variants={prefersReducedMotion ? reducedMotionVariants : staggerItem}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.li>
  );
}
