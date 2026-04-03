/**
 * RichText Component
 *
 * Renders rich HTML content with proper styling.
 * Used for displaying product descriptions, blog posts, etc.
 * Complementary to RichTextEditor (which is for editing).
 *
 * Location: src/components/shared/ (cross-cutting)
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RichTextProps {
  /** HTML content to render */
  content: string;
  /** Text direction for bilingual support */
  dir?: "ltr" | "rtl";
  /** Prose size variant */
  size?: "sm" | "base" | "lg";
  /** Additional CSS classes */
  className?: string;
}

/**
 * RichText — Read-only rich content display
 *
 * Renders HTML safely with Tailwind Typography styles.
 * Use this for displaying descriptions, not editing them.
 *
 * @example
 * <RichText content={product.descriptionEn} dir="ltr" />
 * <RichText content={product.descriptionAr} dir="rtl" size="lg" />
 */
export function RichText({ content, dir = "ltr", size = "base", className }: RichTextProps) {
  if (!content) return null;

  const sizeClasses = {
    sm: "prose-sm",
    base: "prose",
    lg: "prose-lg",
  };

  return (
    <div
      dir={dir}
      className={cn(
        "prose max-w-none dark:prose-invert",
        sizeClasses[size],
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:text-foreground prose-li:text-foreground",
        "prose-a:text-primary hover:prose-a:text-primary/80",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-ul:list-disc prose-ol:list-decimal",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
