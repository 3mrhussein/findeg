import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  bg?: "default" | "surface";
  className?: string;
}

/**
 * Standardized page wrapper for consistent background, max-width, and padding.
 */
export function PageShell({ children, bg = "default", className }: PageShellProps) {
  const bgClass =
    bg === "default" ? "bg-slate-50 dark:bg-slate-950" : "bg-slate-50 dark:bg-slate-900";

  return (
    <div className={cn(bgClass, "min-h-screen py-10 lg:py-16", className)}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
