import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/app/[locale]/(shop)/_components/CategoryCard";
import {
  getCategoriesPageData,
  getShopPageData,
} from "@/features/catalog/application/queries/storefront";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { countProductsByCategoryHierarchy } from "@/features/catalog/application/queries/category-counts";

interface CategoriesPageProps {
  params: Promise<{ locale: string }>;
}

/**
 *
 */
export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale });
  const [categories, shopData] = await Promise.all([
    getCategoriesPageData(locale),
    getShopPageData(locale),
  ]);

  const productCountsByCategory = countProductsByCategoryHierarchy(categories, shopData.products);

  return (
    <div className="bg-background py-10">
      <Container className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("Pages.Home.Categories.Title")}</h1>
          <p className="text-muted-foreground">{t("Pages.Home.Categories.Subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              countLabel={t("Pages.Categories.ProductsCount", {
                count: productCountsByCategory[category.id] || 0,
              })}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
