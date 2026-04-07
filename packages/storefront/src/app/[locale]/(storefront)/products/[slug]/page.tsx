import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getProductDetailPageData,
  getProductIdsForStaticParams,
} from "@features/catalog/application/queries/storefront";

import { setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { ProductGallery } from "./_components/ProductGallery";
import { AddToCartSection } from "./_components/AddToCartSection";
import { ProductTabs } from "./_components/ProductTabs";
import { Star, Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "@i18n/navigation";

/**
 *
 */
export async function generateStaticParams() {
  const productIds = await getProductIdsForStaticParams();
  return productIds.map((id) => ({
    slug: id.toString(),
  }));
}

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

interface ProductContentProps {
  locale: string;
  productId: number;
}

/**
 * Product detail page (thin orchestrator).
 *
 * Calls `setRequestLocale` to enable static rendering per next-intl docs, then
 * delegates to the cached `ProductPageContent`.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const productId = Number(slug);
  if (!Number.isFinite(productId)) notFound();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductPageContent locale={locale} productId={productId} />
    </Suspense>
  );
}

/**
 * Cached product detail content.
 *
 * NOT cached at component level — getTranslations (if added later) would
 * trigger headers() in cache key serialization via next-intl. Data caching
 * is handled at query level in storefront.ts via getProductDetailPageData.
 */
async function ProductPageContent({ locale, productId }: ProductContentProps) {
  const data = await getProductDetailPageData(productId, locale);
  if (!data) notFound();

  const { product, reviews } = data;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/30 min-h-screen py-8 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>

        <main
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start"
          aria-labelledby="product-title"
        >
          {/* Gallery Column */}
          <div className="sticky top-24">
            <div className="rounded-3xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 p-4 lg:p-8 shadow-sm">
              <ProductGallery images={product.variants?.[0]?.images?.map((img) => img.url) ?? []} />
            </div>
          </div>

          {/* Info Column */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {product.categoryName}
                </div>
                <div className="flex items-center text-yellow-500 gap-1.5 text-sm bg-yellow-500/10 dark:bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-slate-900 dark:text-white">{product.rating}</span>
                  <span className="text-slate-500">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              <h1
                id="product-title"
                className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4"
              >
                {product.name}
              </h1>

              <div className="text-3xl font-bold text-primary mb-6">
                {new Intl.NumberFormat("en-EG", {
                  style: "currency",
                  currency: "EGP",
                }).format(product.variants?.[0]?.basePrice ?? 0)}
              </div>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              <AddToCartSection product={product} />

              {/* Features / Trust Badges */}
              <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Quality Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <ProductTabs product={product} reviews={reviews} />
      </div>
    </div>
  );
}
