/**
 * StockHealthBar Component
 *
 * Visual stock status breakdown (healthy/low/out).
 * Horizontal segmented progress bar with tooltips.
 *
 * Location: src/app/[locale]/admin/_components/shared/ (admin-wide)
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface StockHealthBarProps {
  /** Number of variants with healthy stock */
  healthy: number;
  /** Number of variants with low stock */
  low: number;
  /** Number of variants out of stock */
  out: number;
  /** Show labels */
  showLabels?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  /** Additional CSS classes */
  className?: string;
}

/**
 * StockHealthBar — Stock status visualization
 *
 * Displays stock health as segmented bar:
 * - Green: healthy stock
 * - Orange: low stock warning
 * - Red: out of stock
 *
 * @example
 * <StockHealthBar healthy={200} low={3} out={0} showLabels />
 */
export function StockHealthBar({
  healthy,
  low,
  out,
  showLabels = false,
  size = "md",
  className,
}: StockHealthBarProps) {
  const total = healthy + low + out;

  if (total === 0) {
    return <div className={cn("text-sm text-muted-foreground", className)}>No stock data</div>;
  }

  const healthyPercent = (healthy / total) * 100;
  const lowPercent = (low / total) * 100;
  const outPercent = (out / total) * 100;

  const barHeight = size === "sm" ? "h-2" : "h-3";

  return (
    <div className={cn("space-y-2", className)}>
      {/* Visual bar */}
      <TooltipProvider>
        <div className={cn("flex overflow-hidden rounded-full", barHeight)}>
          {/* Healthy segment */}
          {healthy > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="bg-[var(--stock-healthy)] transition-all"
                  style={{ width: `${healthyPercent}%` }}
                  aria-label={`${healthy} healthy`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  <strong>{healthy}</strong> healthy
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Low stock segment */}
          {low > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="bg-[var(--stock-low)] transition-all"
                  style={{ width: `${lowPercent}%` }}
                  aria-label={`${low} low stock`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  <strong>{low}</strong> low stock ⚠
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Out of stock segment */}
          {out > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="bg-[var(--stock-out)] transition-all"
                  style={{ width: `${outPercent}%` }}
                  aria-label={`${out} out of stock`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  <strong>{out}</strong> out of stock ✕
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Labels */}
      {showLabels && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {healthy > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[var(--stock-healthy)]" />
              <span>{healthy} healthy</span>
            </div>
          )}
          {low > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[var(--stock-low)]" />
              <span>{low} low ⚠</span>
            </div>
          )}
          {out > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[var(--stock-out)]" />
              <span>{out} out ✕</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
