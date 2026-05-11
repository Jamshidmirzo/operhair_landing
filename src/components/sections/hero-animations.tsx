"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const baseTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

export function HeroFade({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...baseTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
