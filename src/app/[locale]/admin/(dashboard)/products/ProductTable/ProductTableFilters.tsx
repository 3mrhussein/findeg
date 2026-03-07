"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFilters, UpdateQueryParams } from "./ProductTable.interface";

interface ProductTableFiltersProps {
  filters: ProductFilters;
  total: number;
  shown: number;
  categories: Array<{ id: number; name: string }>;
  brands: Array<{ id: number; name: string }>;
  onUpdate: (params: UpdateQueryParams) => void;
}

/**
 * Filter toolbar — search, category, brand, status selects, clear button.
 */
export function ProductTableFilters({
  filters,
  total,
  shown,
  categories,
  brands,
  onUpdate,
}: ProductTableFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 py-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          data-testid="admin-products-filter-search"
          placeholder="Search name, SKU, description..."
          defaultValue={filters.search}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onUpdate({ search: (event.target as HTMLInputElement).value, page: "1" });
            }
          }}
        />
        <Select
          value={filters.categoryId ? String(filters.categoryId) : "all"}
          onValueChange={(value) =>
            onUpdate({ categoryId: value === "all" ? "" : value, page: "1" })
          }
        >
          <SelectTrigger data-testid="admin-products-filter-category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.brandId ? String(filters.brandId) : "all"}
          onValueChange={(value) => onUpdate({ brandId: value === "all" ? "" : value, page: "1" })}
        >
          <SelectTrigger data-testid="admin-products-filter-brand">
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={String(brand.id)}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.isActive || "all"}
          onValueChange={(value) => onUpdate({ isActive: value, page: "1" })}
        >
          <SelectTrigger data-testid="admin-products-filter-status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="true">Active only</SelectItem>
            <SelectItem value="false">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {shown} of {total} products
        </div>
        <Button
          data-testid="admin-products-filter-clear"
          variant="outline"
          onClick={() =>
            onUpdate({ search: "", categoryId: "", brandId: "", isActive: "all", page: "1" })
          }
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
