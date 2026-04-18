import { ReactNode } from "react";
import { cn } from "@lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * Standardized empty state component for search/filter results.
 */
export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed",
        className,
      )}
    >
      <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
        {icon || <span className="material-symbols-outlined text-[32px]">inventory_2</span>}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md">{description}</p>
    </div>
  );
}
