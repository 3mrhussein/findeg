import { Suspense } from "react";
import ProductDetailTemplate from "./ProductDetailTemplate";
import { products } from "@/lib/constants";

import { routing } from "@/i18n/routing";

/**
 *
 */
export async function generateStaticParams() {
  const locales = ["en", "ar"];
  const params = [];
  for (const locale of locales) {
    for (const product of products) {
      params.push({
        locale,
        id: product.id.toString(),
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailTemplate productId={parseInt(id)} />
    </Suspense>
  );
}
