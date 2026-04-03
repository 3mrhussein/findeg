import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getSearchPageViewModel } from "@/features/catalog/application/queries/search-page";
import { PageShell } from "../_components/PageShell";
import { ProductListingLayout } from "../_components/ProductListingLayout";

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
  const t = await getTranslations({ locale: locale as Locale, namespace: "Pages.Shop" });
  const tSearch = await getTranslations({ locale: locale as Locale, namespace: "Pages.Search" });
  const rawQuery = typeof queryParams.q === "string" ? queryParams.q : "";

  const vm = await getSearchPageViewModel(locale, rawQuery, queryParams);
  const { query, mode, exactCount } = vm;

  if (!query) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 space-y-8 text-center mt-10 lg:mt-20">
          <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {t("SearchListo")}
          </h1>
          <form className="relative flex max-w-xl mx-auto mt-8">
            <Input
              name="q"
              defaultValue={query}
              placeholder={tSearch("Placeholder")}
              className="w-full h-14 pl-6 pr-32 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark text-lg focus-visible:ring-primary shadow-sm"
            />
            <Button
              type="submit"
              className="absolute right-2 top-2 bottom-2 rounded-full px-6 font-bold shadow-sm"
            >
              {t("SearchButton")}
            </Button>
          </form>
          <p className="text-slate-500 mt-4 text-sm max-w-md mx-auto">{t("SearchHint")}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Search Header */}
      <div className="mb-10 lg:mb-12">
        <form className="relative flex max-w-2xl mb-8">
          <Input
            name="q"
            defaultValue={query}
            placeholder={tSearch("Placeholder")}
            className="w-full h-14 pl-6 pr-32 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark text-lg focus-visible:ring-primary shadow-sm"
          />
          <Button
            type="submit"
            className="absolute right-2 top-2 bottom-2 rounded-full px-6 font-bold shadow-sm"
          >
            {t("SearchButton")}
          </Button>
        </form>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Results for &quot;{query}&quot;
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
              <p className="font-bold text-sm">{t("SearchFallbackTitle", { query })}</p>
              <p className="text-sm opacity-90 mt-1">{t("SearchFallbackDescription")}</p>
            </div>
          </div>
        )}
      </div>

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
    </PageShell>
  );
}
