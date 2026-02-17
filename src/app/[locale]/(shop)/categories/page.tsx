import type { Metadata } from "next";
import { Locale } from "next-intl";
import CategoriesTemplate from "./CategoriesTemplate";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategoriesPageData } from "@/features/catalog/application/queries/storefront";
import { buildPageMetadata } from "../_lib/metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 *
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo.Categories" });

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
  const categories = await getCategoriesPageData(locale);

  return <CategoriesTemplate categories={categories} />;
}
