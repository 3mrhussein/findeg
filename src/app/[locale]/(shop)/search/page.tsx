import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "../_components/FilterSidebar";
import { ShopSortSelect } from "../_components/ShopSortSelect";
import { ProductCard } from "../_components/ProductCard";
import { getSearchPageViewModel } from "@/features/catalog/application/queries/search-page";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, Search } from "lucide-react";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 *
 */
export default function SearchPage({ params, searchParams }: SearchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

/**
 *
 */
async function SearchPageContent({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const queryParams = await searchParams;
  const t = await getTranslations({ locale: locale as Locale });
  const rawQuery = typeof queryParams.q === "string" ? queryParams.q : "";
  const {
    query,
    products,
    filteredProducts,
    categoryOptions,
    brandOptions,
    minPrice,
    maxPrice,
    mode,
    exactCount,
  } = await getSearchPageViewModel(locale, rawQuery, queryParams);

  if (!query) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/30 min-h-screen py-10 lg:py-16">
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 space-y-8 text-center mt-10 lg:mt-20">
          <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {t("Nav.Search") || "Search Listo"}
          </h1>
          <form className="relative flex max-w-xl mx-auto mt-8">
            <Input
              name="q"
              defaultValue={query}
              placeholder={
                t("Pages.Search.Placeholder") || "Search for pens, notebooks, backpacks..."
              }
              className="w-full h-14 pl-6 pr-32 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark text-lg focus-visible:ring-primary shadow-sm"
            />
            <Button
              type="submit"
              className="absolute right-2 top-2 bottom-2 rounded-full px-6 font-bold shadow-sm"
            >
              {t("Layout.Header.SearchButton") || "Search"}
            </Button>
          </form>
          <p className="text-slate-500 mt-4 text-sm max-w-md mx-auto">
            Enter a keyword above to find exactly what you need for this school year.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/30 min-h-screen py-10 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-10 lg:mb-12">
          <form className="relative flex max-w-2xl mb-8">
            <Input
              name="q"
              defaultValue={query}
              placeholder={
                t("Pages.Search.Placeholder") || "Search for pens, notebooks, backpacks..."
              }
              className="w-full h-14 pl-6 pr-32 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark text-lg focus-visible:ring-primary shadow-sm"
            />
            <Button
              type="submit"
              className="absolute right-2 top-2 bottom-2 rounded-full px-6 font-bold shadow-sm"
            >
              {t("Layout.Header.SearchButton") || "Search"}
            </Button>
          </form>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Results for "{query}"
          </h1>

          {mode === "fallback" && (
            <div
              data-testid="search-fallback-notice"
              className="mt-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-4 text-amber-900 dark:text-amber-200 flex items-start gap-3"
            >
              <span className="material-symbols-outlined shrink-0 text-amber-600 dark:text-amber-400">
                info
              </span>
              <div>
                <p className="font-bold text-sm">
                  {t("Pages.Search.FallbackNoticeTitle", { query }) ||
                    `No exact match for "${query}"`}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  {t("Pages.Search.FallbackNoticeDescription", { exactCount }) ||
                    "We've broadened your search to show related results."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Area */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-surface-dark rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
              <span className="material-symbols-outlined text-[32px]">search_off</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-sm text-slate-500 max-w-md">
              Try adjusting your search term or browse our categories to find what you're looking
              for.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Mobile Filter */}
            <div className="lg:hidden mb-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex items-center justify-center gap-2 text-sm font-bold text-slate-900 dark:text-white"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[360px] overflow-y-auto">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Filter search results</SheetDescription>
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

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 h-fit sticky top-24">
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <FilterSidebar
                  categories={categoryOptions}
                  brands={brandOptions}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                />
              </div>
            </aside>

            {/* Grid */}
            <main className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Showing {filteredProducts.length} results
                </p>
                <ShopSortSelect />
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500">
                  No products match the selected filters.
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
