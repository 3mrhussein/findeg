import { notFound } from "next/navigation";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "../../_components/PageShell";
import { getShopPlpViewModel } from "@/features/catalog/application/queries/shop-plp";
import { ShopPlpClient } from "../_components/ShopPlpClient";

interface ShopCatchAllPageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Catch-all PLP route for:
 * - /shop
 * - /shop/[category]
 * - /shop/[category]/[sub-category]
 */
export default async function ShopCatchAllPage({ params, searchParams }: ShopCatchAllPageProps) {
  const { locale, slug = [] } = await params;
  const query = await searchParams;
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale: locale as Locale, namespace: "Pages.Shop" });
  const vm = await getShopPlpViewModel(locale, slug, query);

  if (!vm) {
    notFound();
  }

  return (
    <PageShell>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
          {vm.currentCategoryName || t("Title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm md:text-base text-muted-foreground">
          {vm.currentCategoryName
            ? t("CategoryDescription", { category: vm.currentCategoryName })
            : t("Description")}
        </p>
      </div>

      <ShopPlpClient vm={vm} />
    </PageShell>
  );
}
