import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "next-intl";
import { getShopPageViewModel } from "@/features/catalog/application/queries/shop-page";
import { PageShell } from "../_components/PageShell";
import { ProductListingLayout } from "../_components/ProductListingLayout";
import { CategoryPills } from "../_components/CategoryPills";

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
  const t = await getTranslations({ locale: locale as Locale, namespace: "Pages.Shop" });

  const vm = await getShopPageViewModel(locale, query);

  return (
    <PageShell>
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
          {t("Title")}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">{t("Description")}</p>
      </div>

      {/* Horizontal Category Pills */}
      <CategoryPills categories={vm.categoryOptions} />

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
