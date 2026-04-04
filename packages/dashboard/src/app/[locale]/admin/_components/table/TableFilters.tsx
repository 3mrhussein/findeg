/**
 * TableFilters Component
 *
 * Generic filter toolbar for list pages.
 * Search input + dropdown filters.
 *
 * Location: src/app/[locale]/admin/_components/table/ (admin-wide)
 */

"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@findeg/ui";
import { Button } from "@findeg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@findeg/ui";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  /** Filter key */
  key: string;
  /** Filter label */
  label: string;
  /** Filter options */
  options: FilterOption[];
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
}

export interface TableFiltersProps {
  /** Search query */
  searchQuery?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search change handler */
  onSearchChange?: (query: string) => void;
  /** Filter dropdowns */
  filters?: Filter[];
  /** Show clear filters button */
  showClear?: boolean;
  /** Clear all handler */
  onClearAll?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableFilters — Generic filter toolbar
 *
 * @example
 * <TableFilters
 *   searchQuery={search}
 *   searchPlaceholder="Search products..."
 *   onSearchChange={setSearch}
 *   filters={[
 *     {
 *       key: 'category',
 *       label: 'Category',
 *       options: categories,
 *       value: categoryFilter,
 *       onChange: setCategoryFilter,
 *     },
 *   ]}
 *   showClear
 *   onClearAll={resetFilters}
 * />
 */
export function TableFilters({
  searchQuery = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
  showClear = false,
  onClearAll,
  className,
}: TableFiltersProps) {
  const hasActiveFilters =
    searchQuery || filters.some((f) => f.value && f.value !== "all" && f.value !== "");

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Search Input */}
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="ps-10"
          />
        </div>
      )}

      {/* Filter Dropdowns */}
      {filters.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Clear Filters */}
      {showClear && hasActiveFilters && onClearAll && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="gap-2">
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
