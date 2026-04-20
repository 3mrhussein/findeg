"use client";

import { Checkbox } from "@findeg/ui";
import { cn } from "@lib/utils";
import type { FilterOption } from "./FilterSidebar.interface";

interface BrandFilterProps {
  brands: FilterOption[];
  selectedBrandIds: string[];
  onToggle: (brandId: string, add: boolean) => void;
}

/**
 * Brand filter — scrollable list of brand checkboxes.
 */
export function BrandFilter({ brands, selectedBrandIds, onToggle }: BrandFilterProps) {
  return (
    <div className="space-y-1.5">
      {brands.map((brand) => {
        const checked = selectedBrandIds.includes(brand.id);
        return (
          <div key={brand.id} className="flex items-center gap-2.5 py-0.5">
            <Checkbox
              id={`brand-${brand.id}`}
              checked={checked}
              onCheckedChange={(val) => onToggle(brand.id, !!val)}
              className="rounded-[4px] border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
            />
            <label
              htmlFor={`brand-${brand.id}`}
              className={cn(
                "text-sm leading-none cursor-pointer select-none transition-colors",
                checked
                  ? "font-semibold text-primary"
                  : "font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              {brand.label}
              <span className="ms-1 text-xs text-slate-400 dark:text-slate-500 font-normal">
                ({brand.count})
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
