import type { Metadata } from "next";
import ProductDetailTemplate from "./ProductDetailTemplate";
import {
  getProductDetailPageData,
  getProductIdsForStaticParams,
} from "@/features/catalog/application/queries/storefront";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "../../_lib/metadata";

/**
 *
 */
export async function generateStaticParams() {
  const locales = ["en", "ar"];
  const productIds = await getProductIdsForStaticParams();
  const params = [];
  for (const locale of locales) {
    for (const id of productIds) {
      params.push({
        locale,
        id: id.toString(),
      });
    }
  }
  return params;
}

/**
 *
 */
import { setRequestLocale } from "next-intl/server";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

/**
 *
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: Locale }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo.Product" });
  const productId = Number.parseInt(id, 10);

  if (Number.isNaN(productId)) {
    return buildPageMetadata({
      title: t("FallbackTitle"),
      description: t("FallbackDescription"),
    });
  }

  const data = await getProductDetailPageData(productId, locale);
  if (!data) {
    return buildPageMetadata({
      title: t("FallbackTitle"),
      description: t("FallbackDescription"),
    });
  }

  return buildPageMetadata({
    title: t("Title", { name: data.product.name }),
    description: data.product.description || t("FallbackDescription"),
    keywords: t("Keywords")
      .split(",")
      .map((keyword) => keyword.trim()),
  });
}

/**
 *
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: Locale }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const productId = parseInt(id);
  const data = await getProductDetailPageData(productId, locale);

  if (!data) {
    notFound();
  }

  return (
    <ProductDetailTemplate
      product={data.product}
      productReviews={data.reviews}
      recommendedProducts={data.recommendedProducts}
    />
  );
}
