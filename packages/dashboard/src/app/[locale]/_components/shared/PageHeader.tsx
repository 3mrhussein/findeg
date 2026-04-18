/**
 * PageHeader Component
 *
 * Standardized page title section with optional action buttons.
 * Used on all admin list/detail pages.
 *
 * Location: src/app/[locale]/admin/_components/shared/ (admin-wide)
 */

"use client";

import * as React from "react";
import { cn } from "@lib/utils";

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle / description */
  description?: string;
  /** Optional count badge (e.g., "229 products") */
  count?: number;
  /** Action buttons (Create, Export, etc.) */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageHeader — Consistent page title section
 *
 * @example
 * <PageHeader
 *   title="Products"
 *   count={229}
 *   actions={
 *     <>
 *       <Button variant="outline">Bulk Import</Button>
 *       <Button>Create Product</Button>
 *     </>
 *   }
 * />
 */
export function PageHeader({ title, description, count, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {count !== undefined && (
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
