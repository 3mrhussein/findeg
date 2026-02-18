"use client";

import type { Product } from "@/features/catalog/domain/entities/Product";
import { ProductPagination } from "@/components/common/ProductPagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { SectionStateEmpty } from "@/components/common/state/SectionStateEmpty";

interface HomeFeaturedTabsProps {
  allProducts: Product[];
  newestProducts: Product[];
  topRatedProducts: Product[];
}

/**
 * Tabbed featured section for fast product discovery on home page.
 */
export function HomeFeaturedTabs({
  allProducts,
  newestProducts,
  topRatedProducts,
}: HomeFeaturedTabsProps) {
  const t = useTranslations();

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="all">{t("Pages.Home.Featured.TabAll")}</TabsTrigger>
        <TabsTrigger value="new">{t("Pages.Home.Featured.TabNew")}</TabsTrigger>
        <TabsTrigger value="top">{t("Pages.Home.Featured.TabTopRated")}</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <ProductPagination products={allProducts} />
      </TabsContent>

      <TabsContent value="new">
        {newestProducts.length > 0 ? (
          <ProductPagination products={newestProducts} />
        ) : (
          <SectionStateEmpty
            title={t("Pages.Home.Featured.EmptyTitle")}
            description={t("Pages.Home.Featured.EmptyDescription")}
          />
        )}
      </TabsContent>

      <TabsContent value="top">
        {topRatedProducts.length > 0 ? (
          <ProductPagination products={topRatedProducts} />
        ) : (
          <SectionStateEmpty
            title={t("Pages.Home.Featured.EmptyTitle")}
            description={t("Pages.Home.Featured.EmptyDescription")}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
