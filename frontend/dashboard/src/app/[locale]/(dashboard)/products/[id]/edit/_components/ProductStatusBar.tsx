/**
 * ProductStatusBar — Status indicator bar for product edit page
 *
 * Shows:
 * - Live/Draft indicator
 * - Last saved timestamp
 * - "View on storefront" link (when live)
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/[id]/edit/_components/
 * Used by: ProductEditForm (edit mode only)
 */

"use client";

import * as React from "react";
import { Link } from "@i18n/navigation";
import { Badge } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { ExternalLink, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@lib/utils";

interface ProductStatusBarProps {
  /** Product ID for storefront link */
  productId: number;
  /** Product slug for storefront URL */
  slug?: string;
  /** Is product currently active/live? */
  isActive: boolean;
  /** Last saved timestamp */
  updatedAt?: Date;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ProductStatusBar — Status and actions bar for edit mode
 *
 * @example
 * <ProductStatusBar
 *   productId={product.id}
 *   slug={product.slug}
 *   isActive={product.isActive}
 *   updatedAt={product.updatedAt}
 * />
 */
export function ProductStatusBar({
  productId,
  slug,
  isActive,
  updatedAt,
  className,
}: ProductStatusBarProps) {
  const lastSavedText = updatedAt
    ? `Saved ${formatDistanceToNow(updatedAt, { addSuffix: true })}`
    : "Not saved yet";

  const storefrontUrl = slug ? `/products/${slug}` : `/products/${productId}`;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3",
        className,
      )}
    >
      {/* Left: Status & Last Saved */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <Badge variant={isActive ? "default" : "secondary"} className="gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-green-500" : "bg-gray-400")} />
          {isActive ? "Live" : "Draft"}
        </Badge>

        {/* Last Saved */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{lastSavedText}</span>
        </div>
      </div>

      {/* Right: View on Storefront (if live) */}
      {isActive && (
        <Button variant="outline" size="sm" asChild>
          <Link href={storefrontUrl} target="_blank">
            <ExternalLink className="h-4 w-4 me-1.5" />
            View on Storefront
          </Link>
        </Button>
      )}
    </div>
  );
}
