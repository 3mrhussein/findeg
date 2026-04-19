import { ReactNode } from "react";
import { FilterSidebar } from "./FilterSidebar";
import { ShopSortSelect } from "./ShopSortSelect";
import { ShopViewSwitcher } from "./ShopViewSwitcher";
import { ProductGridList } from "./ProductGridList";
import { Button } from "@ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@ui";
import { Filter } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { Product } from "@backend/features/catalog/domain/entities/Product";
import { FilterOption, CategoryFilterOption } from "@backend/features/catalog/application/queries/listing";

interface ProductListingLayoutProps {
  products: Product[];
  filteredProducts: Product[];
  categoryOptions: CategoryFilterOption[];
  brandOptions: FilterOption[];
  minPrice: number;
  maxPrice: number;
  resultsCountLabel: string;
  filtersTitle?: string;
  noProductsTitle?: string;
  noProductsDescription?: string;
  loadMoreLabel?: string;
}

/**
 * Shared layout for product listing pages (Shop, Search, Categories, Collections).
 */
export function ProductListingLayout({
  products,
  filteredProducts,
  categoryOptions,
  brandOptions,
  minPrice,
  maxPrice,
  resultsCountLabel,
  filtersTitle = "Filters",
  noProductsTitle = "No products found",
  noProductsDescription = "Try adjusting your filters to see more options.",
  loadMoreLabel = "Load More",
}: ProductListingLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Mobile Filter Trigger */}
      <div className="lg:hidden mb-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-12 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex items-center justify-center gap-2 text-sm font-bold text-slate-900 dark:text-white"
            >
              <Filter className="w-4 h-4" />
              {filtersTitle}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[360px] overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>{filtersTitle}</SheetTitle>
              <SheetDescription>{noProductsDescription}</SheetDescription>
            </SheetHeader>
            <FilterSidebar
              categories={categoryOptions}
              brands={brandOptions}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters Sidebar */}
      <aside
        className="hidden lg:block w-72 shrink-0 sticky top-24 self-start"
        aria-label={filtersTitle}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto">
          <div className="p-5">
            <FilterSidebar
              categories={categoryOptions}
              brands={brandOptions}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </div>
        </div>
      </aside>

      {/* Product Results Area */}
      <main className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {resultsCountLabel}
          </p>
          <div className="flex items-center gap-4">
            <ShopSortSelect />
            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <ShopViewSwitcher />
          </div>
        </div>

        {/* Empty State or Results Grid */}
        {filteredProducts.length === 0 ? (
          <EmptyState title={noProductsTitle} description={noProductsDescription} />
        ) : (
          <ProductGridList products={filteredProducts} />
        )}

        {/* Load More */}
        {filteredProducts.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Button
              variant="outline"
              className="rounded-full px-8 h-12 text-sm font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
            >
              {loadMoreLabel}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
