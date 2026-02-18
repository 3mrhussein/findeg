import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";

interface TooltipProps {
  tip: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

/**
 *
 */
export function Tooltip({ tip, children, side = "top" }: TooltipProps) {
  return (
    <TooltipProvider>
      <UiTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{tip}</TooltipContent>
      </UiTooltip>
    </TooltipProvider>
  );
}
