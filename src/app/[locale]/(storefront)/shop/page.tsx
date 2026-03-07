import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "next-intl";
import { getShopPageViewModel } from "@/features/catalog/application/queries/shop-page";
import { getShopPageData } from "@/features/catalog/application/queries/storefront";
import { resolveLocale } from "@/features/core/domain/value-objects";
import {
  buildCategoryTree,
  getPriceBounds,
  buildBrandOptions,
} from "@/features/catalog/application/queries/listing";
import { PageShell } from "../_components/PageShell";
import { ProductListingLayout } from "../_components/ProductListingLayout";
import { CategoryPills } from "../_components/CategoryPills";
import { getServices } from "@/server/getServices";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Shop page entry.
 *
 * Implements **Partial Prerendering** (PPR):
 *
 * - The outer shell (page header, category pills) is a cached component
 *   that goes into the static HTML shell.
 * - The filter-dependent product grid (`FilteredShopContent`) is wrapped in
 *   `<Suspense>` and streamed at request time because it depends on
 *   `searchParams` (a runtime API).
 *
 * This means users get instant above-the-fold content + skeleton grid,
 * while the personalized filtered results stream in rapidly.
 */
export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  // Await params outside cached scopes — params Promise is not serializable.
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <PageShell>
      {/* Cached header + category pills — part of static shell */}
      <Suspense fallback={null}>
        <ShopPageShell locale={locale} />
      </Suspense>

      {/* Filter-dependent grid — streams at request time */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 mt-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-200 dark:bg-slate-800 aspect-3/4" />
            ))}
          </div>
        }
      >
        <FilteredShopContent locale={locale} searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}

interface ShopShellProps {
  locale: string;
}

/**
 * Cached shop page shell — page header and category navigation pills.
 *
 * This component is cached with the `hours` profile and tagged so admin
 * product/category changes bust it. It does NOT read searchParams, so it
 * can be included in the static HTML shell via PPR.
 */
async function ShopPageShell({ locale }: ShopShellProps) {
  const resolvedLocale = resolveLocale(locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Pages.Shop" });
  const { categories } = getServices();
  const [shopData, allCategories] = await Promise.all([
    getShopPageData(resolvedLocale),
    categories.getAll(resolvedLocale),
  ]);

  const categoryOptions = buildCategoryTree(allCategories, shopData.products);

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
          {t("Title")}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">{t("Description")}</p>
      </div>

      {/* Horizontal Category Pills */}
      <CategoryPills categories={categoryOptions} />
    </>
  );
}

interface FilteredShopContentProps {
  locale: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Dynamic (streamed) shop product grid.
 *
 * Depends on `searchParams` — a runtime API — so it runs at request time.
 * `getShopPageViewModel` internally calls the cached `getShopPageData`,
 * so the DB query is served from cache and only the in-memory filter
 * computation runs per-request.
 */
async function FilteredShopContent({ locale, searchParams }: FilteredShopContentProps) {
  const query = await searchParams;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Pages.Shop" });
  const vm = await getShopPageViewModel(locale, query);

  return (
    <ProductListingLayout
      {...vm}
      resultsCountLabel={t("ShowingResults", {
        count: vm.filteredProducts.length,
        total: vm.products.length,
      })}
      filtersTitle={t("FiltersTitle")}
      noProductsTitle={t("NoProductsTitle")}
      noProductsDescription={t("NoProductsDescription")}
      loadMoreLabel={t("LoadMore")}
    />
  );
}
