"use client";

import { useState } from "react";
import { Checkbox } from "@findeg/ui";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryFilterOption } from "./FilterSidebar.interface";
import { getAllSlugs } from "./FilterSidebar.interface";

interface CategoryTreeProps {
  category: CategoryFilterOption;
  selectedSlugs: string[];
  onToggle: (slugs: string[], forceValue: boolean) => void;
  depth?: number;
}

/**
 * Recursive category row with expand/collapse and indeterminate checkbox state.
 */
export function CategoryTree({ category, selectedSlugs, onToggle, depth = 0 }: CategoryTreeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = (category.children?.length ?? 0) > 0;

  const childSlugs = (category.children ?? []).map((c) => c.id);
  const selfSelected = selectedSlugs.includes(category.id);
  const selectedChildCount = childSlugs.filter((s) => selectedSlugs.includes(s)).length;

  let checkedState: boolean | "indeterminate";
  if (!hasChildren) {
    checkedState = selfSelected;
  } else {
    const allSelected = childSlugs.length > 0 && selectedChildCount === childSlugs.length;
    const someSelected = selectedChildCount > 0;
    checkedState = allSelected ? true : someSelected ? "indeterminate" : false;
  }

  /**
   *
   */
  const handleToggle = () => {
    if (!hasChildren) {
      onToggle([category.id], !selfSelected);
    } else {
      const allSelected = selfSelected && selectedChildCount === childSlugs.length;
      onToggle(getAllSlugs(category), !allSelected);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2.5 py-1.5 rounded-lg",
          depth > 0 && "ps-3 border-s-2 border-slate-200 dark:border-slate-700 ms-3",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronRight
              className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-90")}
            />
          </button>
        ) : (
          <span className="shrink-0 size-3.5" />
        )}

        <Checkbox
          id={`cat-${category.id}-${depth}`}
          checked={checkedState}
          onCheckedChange={handleToggle}
          className={cn(
            "rounded-[4px] shrink-0",
            "border-slate-300 dark:border-slate-600",
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
            "data-[state=indeterminate]:bg-primary/20 data-[state=indeterminate]:border-primary dark:data-[state=indeterminate]:bg-primary/30",
          )}
        />

        <label
          htmlFor={`cat-${category.id}-${depth}`}
          className={cn(
            "flex-1 text-sm leading-none cursor-pointer select-none transition-colors",
            checkedState === true
              ? "font-semibold text-primary"
              : checkedState === "indeterminate"
                ? "font-medium text-primary/80 dark:text-primary/70"
                : "font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          {category.label}
          <span className="ms-1 text-xs text-slate-400 dark:text-slate-500 font-normal">
            ({category.count})
          </span>
        </label>
      </div>

      {hasChildren && expanded && (
        <div className="ms-3 mt-0.5 space-y-0.5">
          {category.children!.map((child) => (
            <CategoryTree
              key={child.id}
              category={child}
              selectedSlugs={selectedSlugs}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
