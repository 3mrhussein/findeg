"use client";

import type { SortOption, ViewMode } from "@/lib/types";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { Grid } from "@/components/layout/Grid";
import { ProductCard } from "@/components/common/ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { Button } from "@/components/ui/button";
import { ProductListItem } from "@/components/common/ProductListItem";
import { Pagination } from "@/components/common/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/common/Icon";
import { SectionStateEmpty } from "@/components/common/state/SectionStateEmpty";

interface SortOptionItem {
  value: SortOption;
  label: string;
}

interface ShopContentViewProps {
  products: Product[];
  sortedProducts: Product[];
  currentProducts: Product[];
  sortOption: SortOption;
  viewMode: ViewMode;
  sortOptions: SortOptionItem[];
  filtersTitle: string;
  sortByLabel: string;
  showingResultsLabel: string;
  noProductsLabel: string;
  gridViewLabel: string;
  listViewLabel: string;
  onFilterChange: (newFilteredProducts: Product[]) => void;
  onSortChange: (value: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pure UI view for the shop listing experience.
 */
export function ShopContentView({
  products,
  sortedProducts,
  currentProducts,
  sortOption,
  viewMode,
  sortOptions,
  filtersTitle,
  sortByLabel,
  showingResultsLabel,
  noProductsLabel,
  gridViewLabel,
  listViewLabel,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  currentPage,
  totalPages,
  onPageChange,
}: ShopContentViewProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
      <div className="hidden lg:block lg:w-1/4 xl:w-1/5 lg:sticky lg:top-28 self-start">
        <FilterSidebar allProducts={products} onFilterChange={onFilterChange} />
      </div>

      <div className="w-full">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="w-full lg:hidden mb-6 min-h-11">
              {filtersTitle}
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{filtersTitle}</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <FilterSidebar allProducts={products} onFilterChange={onFilterChange} />
            </div>
          </DialogContent>
        </Dialog>

        <Card className="flex flex-wrap gap-4 justify-between items-center mb-6 p-4">
          <p className="text-muted-foreground text-sm">{showingResultsLabel}</p>
          <div className="flex items-center gap-2">
            <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
              <SelectTrigger className="w-44 sm:w-48 min-h-10" aria-label={sortByLabel}>
                <SelectValue placeholder={sortByLabel} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
              aria-label={gridViewLabel}
            >
              <Icon name="grid" className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("list")}
              aria-label={listViewLabel}
            >
              <Icon name="list" className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {currentProducts.length > 0 ? (
          viewMode === "grid" ? (
            <Grid>
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Grid>
          ) : (
            <div className="space-y-4">
              {currentProducts.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          <SectionStateEmpty message={noProductsLabel} />
        )}

        {sortedProducts.length > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        ) : null}
      </div>
    </div>
  );
}
