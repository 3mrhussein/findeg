import { Container } from "@/components/shared/Container";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { ShopSortSelect } from "../_components/ShopSortSelect";
import { ShopPaginatedResults } from "../_components/ShopPaginatedResults";
import { FilterSidebar } from "../_components/FilterSidebar";
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
 * Main Shop Page
 */
export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale: locale as Locale });
  const { products, filteredProducts, categoryOptions, brandOptions, minPrice, maxPrice } =
    await getShopPageViewModel(locale, query);

  return (
    <div className="bg-background py-10">
      <Container>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden mb-4">
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
            className="hidden lg:block w-64 shrink-0"
            aria-label={t("Pages.Shop.FiltersTitle")}
          >
            <FilterSidebar
              categories={categoryOptions}
              brands={brandOptions}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </aside>

          <main className="flex-1 space-y-6" aria-labelledby="shop-results-heading">
            <div className="space-y-3">
              <h1 id="shop-results-heading" className="text-3xl font-bold">
                {t("Pages.Shop.Title")}
              </h1>
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

            <ShopPaginatedResults products={filteredProducts} />
          </main>
        </div>
      </Container>
    </div>
  );
}
