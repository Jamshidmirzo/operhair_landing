"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const baseTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

/**
 * Reveal — small client-island used by server sections for scroll-triggered
 * fade+slide-up animations. Mirrors the pattern from `HeroFade` but uses
 * `whileInView` so the animation fires when the element enters the viewport.
 *
 * Stagger is achieved via `delay` (in seconds). Pass 0, 0.1, 0.2, ... for
 * the typical 100ms cadence used across the landing.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    if (as === "li") return <li className={className}>{children}</li>;
    return <div className={className}>{children}</div>;
  }

  const Cmp = as === "li" ? motion.li : motion.div;
  return (
    <Cmp
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...baseTransition, delay }}
    >
      {children}
    </Cmp>
  );
}
