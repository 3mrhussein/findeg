import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "next-intl";
import { FilterSidebar } from "../_components/FilterSidebar";
import { ShopSortSelect } from "../_components/ShopSortSelect";
import { ProductCard } from "../_components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { getShopPageViewModel } from "@/features/catalog/application/queries/shop-page";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 *
 */
export default function ShopPage({ params, searchParams }: ShopPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

/**
 *
 */
async function ShopPageContent({ params, searchParams }: ShopPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const query = await searchParams;
  const t = await getTranslations({ locale: locale as Locale });

  const { products, filteredProducts, categoryOptions, brandOptions, minPrice, maxPrice } =
    await getShopPageViewModel(locale, query);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/30 min-h-screen py-10 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 lg:mb-12">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            {t("Pages.Shop.Title") || "All Products"}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Browse our complete collection of premium stationery and school supplies designed to
            make learning a joy.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden mb-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex items-center justify-center gap-2 text-sm font-bold text-slate-900 dark:text-white"
                  aria-label={t("Pages.Shop.OpenFilters")}
                >
                  <Filter className="w-4 h-4" />
                  {t("Pages.Shop.FiltersTitle") || "Filters"}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[360px] overflow-y-auto">
                <SheetHeader className="sr-only">
                  <SheetTitle>{t("Pages.Shop.FiltersDialogTitle")}</SheetTitle>
                  <SheetDescription>{t("Pages.Shop.FiltersDialogDescription")}</SheetDescription>
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
            className="hidden lg:block w-72 shrink-0 h-fit sticky top-24"
            aria-label={t("Pages.Shop.FiltersTitle")}
          >
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <FilterSidebar
                categories={categoryOptions}
                brands={brandOptions}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </div>
          </aside>

          {/* Product Results Area */}
          <main className="flex-1 min-w-0" aria-labelledby="shop-results-heading">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("Pages.Shop.ShowingResults", {
                  count: filteredProducts.length,
                  total: products.length,
                }) || `Showing ${filteredProducts.length} results`}
              </p>
              <ShopSortSelect />
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                  <span className="material-symbols-outlined text-[32px]">inventory_2</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Try adjusting your filters or browsing a different category to see more options.
                </p>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            )}

            {/* Pagination placeholder if `ShopPaginatedResults` logic wasn't kept inline */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 flex justify-center">
                {/* This would be a real pagination component if you have one. 
                     For now, we render a generic "Load More" to match List UX */}
                <Button
                  variant="outline"
                  className="rounded-full px-8 h-12 text-sm font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                >
                  Load More
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
