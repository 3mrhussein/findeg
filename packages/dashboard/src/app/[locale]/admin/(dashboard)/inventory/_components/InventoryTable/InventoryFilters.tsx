"use client";

import { Input } from "@ui";
import type { SortKey } from "./InventoryTable.interface";

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  lowStockOnly: boolean;
  onLowStockChange: (value: boolean) => void;
}

/**
 * Filter toolbar — search input, sort dropdown, low-stock checkbox.
 */
export function InventoryFilters({
  searchTerm,
  onSearchChange,
  sortKey,
  onSortChange,
  lowStockOnly,
  onLowStockChange,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="space-y-1">
        <p className="text-sm font-medium">Search</p>
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by product name or SKU"
          className="w-full md:w-80"
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Sort</p>
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="stock-asc">Stock (Low to High)</option>
          <option value="stock-desc">Stock (High to Low)</option>
        </select>
      </div>
      <label className="inline-flex items-center gap-2 text-sm md:mt-6">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => onLowStockChange(e.target.checked)}
        />
        Low stock only
      </label>
    </div>
  );
}
