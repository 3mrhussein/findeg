/**
 * StatusBadge Component
 *
 * Colored status pill for products, orders, and other entities.
 * Uses design tokens from globals.css for consistent theming.
 *
 * Location: src/components/shared/ (cross-cutting)
 */

"use client";

import * as React from "react";
import { Badge } from "@findeg/ui";
import { cn } from "@lib/utils";
import { OrderStatus } from "@findeg/backend/features/core/domain/types/common";

type ProductStatus = "active" | "draft" | "inactive";
type StockStatus = "healthy" | "low" | "out";

export type StatusType = OrderStatus | ProductStatus | StockStatus;

export interface StatusBadgeProps {
  /** Status value */
  status: StatusType;
  /** Display label (overrides default label) */
  label?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Maps status values to CSS color variables
 */
const STATUS_COLORS: Record<StatusType, string> = {
  // Product statuses
  active: "var(--status-active)",
  draft: "var(--status-draft)",

  // Order statuses
  pending: "var(--status-pending)",
  confirmed: "var(--status-confirmed)",
  processing: "var(--status-processing)",
  shipped: "var(--status-shipped)",
  delivered: "var(--status-delivered)",
  cancelled: "var(--status-cancelled)",
  refunded: "var(--status-cancelled)",

  // Stock health
  healthy: "var(--stock-healthy)",
  low: "var(--stock-low)",
  out: "var(--stock-out)",
  inactive: "var(--status-draft)",
};

/**
 * Default labels for common statuses
 */
const STATUS_LABELS: Record<StatusType, string> = {
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  healthy: "Healthy",
  low: "Low Stock",
  out: "Out of Stock",
};

/**
 * StatusBadge — Colored status indicator
 *
 * @example
 * <StatusBadge status="active" />
 * <StatusBadge status="pending" label="Awaiting Payment" />
 * <StatusBadge status="low" size="sm" />
 */
export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || "var(--status-draft)";
  const displayLabel = label || STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 font-medium capitalize",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className,
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <span
        className={cn(
          "me-1.5 inline-block rounded-full",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        )}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {displayLabel}
    </Badge>
  );
}
