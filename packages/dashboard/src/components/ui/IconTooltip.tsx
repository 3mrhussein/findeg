"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconTooltipProps {
  icon?: LucideIcon;
  label: string;
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
  asChild?: boolean;
  /** Tooltip side (default: "bottom") */
  side?: "top" | "right" | "bottom" | "left";
  /** Icon size in px (default: 20) */
  size?: number;
}

/**
 * A wrapper component that renders any Lucide icon with an automatic Tooltip.
 * This component is used system-wide for actionable icons.
 */
export function IconTooltip({
  icon: Icon,
  label,
  className,
  iconClassName,
  children,
  asChild = false,
  side = "bottom",
  size = 20,
}: IconTooltipProps) {
  const trigger =
    asChild && children ? (
      children
    ) : Icon ? (
      <span
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity",
          className,
        )}
      >
        <Icon size={size} aria-hidden className={iconClassName} />
      </span>
    ) : null;

  if (!trigger) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
