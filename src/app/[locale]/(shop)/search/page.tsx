import { Container } from "@/components/shared/Container";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionStateEmpty } from "@/components/shared/state/SectionStateEmpty";
import { FilterSidebar } from "../_components/FilterSidebar";
import { ShopSortSelect } from "../_components/ShopSortSelect";
import { ShopPaginatedResults } from "../_components/ShopPaginatedResults";
import { getSearchPageViewModel } from "@/features/catalog/application/queries/search-page";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 *
 */
export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
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
      <div className="bg-background py-10">
        <Container className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{t("Nav.Search")}</h1>
            <form className="flex gap-2">
              <Input name="q" defaultValue={query} placeholder={t("Pages.Search.Placeholder")} />
              <Button type="submit">{t("Layout.Header.SearchButton")}</Button>
            </form>
            <p className="text-muted-foreground">{t("Pages.Search.EmptyPrompt")}</p>
          </div>
          <SectionStateEmpty
            title={t("Pages.Search.EmptyPrompt")}
            description={t("Pages.Search.EmptyDescription")}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-background py-10">
      <Container>
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold">{t("Nav.Search")}</h1>
          <form className="flex gap-2">
            <Input name="q" defaultValue={query} placeholder={t("Pages.Search.Placeholder")} />
            <Button type="submit">{t("Layout.Header.SearchButton")}</Button>
          </form>
          <p className="text-muted-foreground">{t("Pages.Search.PageTitle", { query })}</p>
          {mode === "fallback" ? (
            <div
              data-testid="search-fallback-notice"
              className="rounded-md border border-amber-500/30 bg-amber-100/40 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
            >
              <p className="font-medium">{t("Pages.Search.FallbackNoticeTitle", { query })}</p>
              <p className="text-xs opacity-90">
                {t("Pages.Search.FallbackNoticeDescription", { exactCount })}
              </p>
            </div>
          ) : null}
        </div>

        {products.length === 0 ? (
          <SectionStateEmpty
            title={t("Pages.Search.NoResults")}
            description={t("Pages.Search.NoResultsDescription")}
          />
        ) : (
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="md:hidden mb-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    aria-label={t("Pages.Shop.OpenFilters")}
                  >
                    <Filter className="w-4 h-4" />
                    {t("Pages.Shop.FiltersTitle")}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
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

            <aside
              className="hidden md:block w-64 shrink-0"
              aria-label={t("Pages.Shop.FiltersTitle")}
            >
              <FilterSidebar
                categories={categoryOptions}
                brands={brandOptions}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </aside>

            <main className="flex-1 space-y-6" aria-labelledby="search-results-heading">
              <div className="space-y-3">
                <h2 id="search-results-heading" className="text-2xl font-semibold">
                  {t("Pages.Search.PageTitle", { query })}
                </h2>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-muted-foreground">
                    {t("Pages.Shop.ShowingResults", {
                      count: filteredProducts.length,
                      total: products.length,
                    })}
                  </p>
                  <ShopSortSelect />
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <ShopPaginatedResults products={filteredProducts} />
              ) : (
                <SectionStateEmpty
                  title={t("Pages.Shop.NoProducts")}
                  description={t("Pages.Search.NoResultsDescription")}
                />
              )}
            </main>
          </div>
        )}
      </Container>
    </div>
  );
}
