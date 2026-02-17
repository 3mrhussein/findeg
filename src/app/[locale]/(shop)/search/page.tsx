import type { Metadata } from "next";
import SearchTemplate from "./SearchTemplate";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSearchPageData } from "@/features/catalog/application/queries/storefront";
import { Locale } from "next-intl";
import { buildPageMetadata } from "../_lib/metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string }>;
};

/**
 *
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "Seo.Search" });
  const normalizedQuery = q.trim();

  if (!normalizedQuery) {
    return buildPageMetadata({
      title: t("EmptyTitle"),
      description: t("EmptyDescription"),
      robots: { index: false, follow: true },
    });
  }

  return buildPageMetadata({
    title: t("Title", { query: normalizedQuery }),
    description: t("Description", { query: normalizedQuery }),
    robots: { index: false, follow: true },
  });
}

/**
 *
 */
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);
  const { products, query } = await getSearchPageData(locale, q);

  return <SearchTemplate searchQuery={query} products={products} />;
}
