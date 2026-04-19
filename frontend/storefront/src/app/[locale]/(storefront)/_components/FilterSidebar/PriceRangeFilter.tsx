"use client";

import { Slider } from "@ui";

interface PriceRangeFilterProps {
  priceRange: [number, number];
  minPrice: number;
  maxPrice: number;
  onChange: (range: [number, number]) => void;
}

/**
 * Price range filter — dual-handle slider with min/max labels.
 */
export function PriceRangeFilter({
  priceRange,
  minPrice,
  maxPrice,
  onChange,
}: PriceRangeFilterProps) {
  return (
    <div className="space-y-4 px-1">
      <Slider
        value={priceRange}
        onValueChange={(val) => onChange(val as [number, number])}
        max={maxPrice}
        min={minPrice}
        step={1}
        className="**:[[role=slider]]:h-4 **:[[role=slider]]:w-4 **:[[role=slider]]:bg-primary **:[[role=slider]]:border-none **:[[role=slider]]:shadow-md"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 text-center py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          {priceRange[0].toLocaleString()} <span className="font-normal text-slate-400">EGP</span>
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">—</span>
        <span className="flex-1 text-center py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          {priceRange[1].toLocaleString()} <span className="font-normal text-slate-400">EGP</span>
        </span>
      </div>
    </div>
  );
}
