import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 *
 */
export function Grid({ children, className, ...props }: GridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}
