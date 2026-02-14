import React from "react";
import { renderLucideIcon, type IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type { IconName };

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}

/**
 * Standard Icon component using Lucide React.
 * Replaces custom SVG paths to prevent Turbopack panics.
 */
export const Icon: React.FC<IconProps> = ({ name, className, size, ...props }) => {
  return renderLucideIcon(name, {
    className: cn("shrink-0", className),
    size: size || (props.width as any) || (props.height as any) || 24,
    ...props,
  } as any);
};
