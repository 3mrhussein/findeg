"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AnimationProviderProps {
  children: React.ReactNode;
}

/**
 *
 */
export function AnimationProvider({ children }: AnimationProviderProps) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}

/**
 *
 */
export const FadeIn = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.4, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 *
 */
export const SlideUp = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);
