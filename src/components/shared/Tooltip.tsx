"use client";

import {
  TooltipProvider,
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

/**
 *
 */
export function Tooltip({
  children,
  tip,
  side,
}: {
  children: React.ReactNode;
  tip: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <TooltipProvider>
      <UITooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{tip}</TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}
