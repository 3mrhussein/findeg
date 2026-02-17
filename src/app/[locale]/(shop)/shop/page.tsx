import type { Metadata } from "next";
import { Locale } from "next-intl";
import ShopTemplate from "./ShopTemplate";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getShopPageData } from "@/features/catalog/application/queries/storefront";
import { buildPageMetadata } from "../_lib/metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 *
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo.Shop" });

  return buildPageMetadata({
    title: t("Title"),
    description: t("Description"),
    keywords: t("Keywords")
      .split(",")
      .map((keyword) => keyword.trim()),
  });
}

/**
 *
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { products } = await getShopPageData(locale);

  return <ShopTemplate products={products} />;
}
