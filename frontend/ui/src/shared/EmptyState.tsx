/**
 * EmptyState Component
 *
 * Displays a helpful empty state when lists/tables have no data.
 * Used across admin (product lists, order lists) and storefront (search results, cart).
 *
 * Location: src/components/shared/ (cross-cutting)
 */

"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../lib/utils";

export interface EmptyStateProps {
  /** Lucide icon name (e.g., "Package", "ShoppingCart") */
  icon?: keyof typeof LucideIcons;
  /** Primary heading */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState — Consistent empty list/table state
 *
 * @example
 * <EmptyState
 *   icon="Package"
 *   title="No products found"
 *   description="Try adjusting your filters or add your first product"
 *   action={{
 *     label: "Create Product",
 *     onClick: () => router.push('/admin/products/new')
 *   }}
 * />
 */
export function EmptyState({
  icon = "FileQuestion",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const IconComponent = LucideIcons[icon] as LucideIcons.LucideIcon;

  return (
    <div
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}
    >
      {IconComponent && (
        <IconComponent
          className="mb-4 h-16 w-16 text-muted-foreground/40"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mb-6 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant={action.variant || "default"}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
