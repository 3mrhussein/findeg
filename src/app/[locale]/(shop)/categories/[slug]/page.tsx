import { Container } from "@/components/shared/Container";
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
import { getServices } from "@/server/getServices";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { ShopSortSelect } from "../../_components/ShopSortSelect";
import { ShopPaginatedResults } from "../../_components/ShopPaginatedResults";
import { FilterSidebar } from "../../_components/FilterSidebar";
import { SectionStateEmpty } from "@/components/shared/state/SectionStateEmpty";
import {
  applyListingFilters,
  buildBrandOptions,
  buildCategoryOptions,
  getPriceBounds,
  parseListingFilters,
} from "@/features/catalog/application/queries/listing";
import { resolveLocale } from "@/features/core/domain/value-objects";

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 *
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug, locale } = await params;
  const resolvedLocale = resolveLocale(locale);
  const query = await searchParams;
  const t = await getTranslations({ locale: locale as Locale });

  const { categories, products } = getServices();
  const category = await categories.getBySlug(slug, resolvedLocale);
  if (!category) notFound();
  const [categoryProducts, allCategories] = await Promise.all([
    products.getByCategory(category.id, resolvedLocale),
    categories.getAll(resolvedLocale),
  ]);

  const categoryOptions = buildCategoryOptions(allCategories, categoryProducts);
  const brandOptions = buildBrandOptions(categoryProducts);
  const { minPrice, maxPrice } = getPriceBounds(categoryProducts);
  const filters = parseListingFilters(query, [minPrice, maxPrice]);
  const filteredProducts = applyListingFilters({
    products: categoryProducts,
    categories: allCategories,
    filters,
  });

  return (
    <div className="bg-background py-8">
      <Container>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Trigger */}
          <div className="md:hidden mb-4">
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

          {/* Desktop Sidebar */}
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

          {/* Product Grid */}
          <main className="flex-1 space-y-6" aria-labelledby="category-results-heading">
            <div className="space-y-3">
              <h1 id="category-results-heading" className="text-3xl font-bold capitalize mb-2">
                {category.name}
              </h1>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-muted-foreground">
                  {t("Pages.Shop.ShowingResults", {
                    count: filteredProducts.length,
                    total: categoryProducts.length,
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
      </Container>
    </div>
  );
}
