import { ReactNode } from "react";

/**
 *
 */
export function Grid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`grid ${className || ""}`}>{children}</div>;
}
