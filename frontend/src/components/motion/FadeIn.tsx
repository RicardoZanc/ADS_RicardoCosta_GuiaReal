"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { easeOut, fadeInUp, reducedMotionVariants } from "@/lib/motion";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function FadeIn({
  className,
  delay = 0,
  children,
  ...props
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={prefersReducedMotion ? reducedMotionVariants : fadeInUp}
      transition={{ ...easeOut, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
