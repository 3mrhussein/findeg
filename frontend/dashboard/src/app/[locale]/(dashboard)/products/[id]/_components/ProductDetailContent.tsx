/**
 * ProductDetailContent Component
 *
 * Server component that fetches and displays product detail.
 * Used within Suspense boundaries in product detail page for progressive rendering.
 */

import { resolveLocale } from "@backend/features/core";
import { notFound } from "next/navigation";
import { ProductForm } from "../../_components/ProductForm";
import { getProductById } from "@data/products/queries";
import { getAllCategories, getAllBrands } from "@data/resources/queries";

interface ProductDetailContentProps {
  productId: number;
  locale: string;
}

export async function ProductDetailContent({ productId, locale }: ProductDetailContentProps) {
  const resolvedLocale = resolveLocale(locale);

  // Fetch product data from data layer
  const product = await getProductById(productId, resolvedLocale);

  // If product not found, return 404
  if (!product) {
    return notFound();
  }

  // Fetch categories and brands in parallel
  const [categories, brands] = await Promise.all([
    getAllCategories(resolvedLocale),
    getAllBrands(false, resolvedLocale),
  ]);

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
      </div>
      <div className="max-w-2xl">
        <ProductForm
          initialData={product as any}
          categories={categories}
          brands={brands}
          tags={[]}
          locale={resolvedLocale}
        />
      </div>
    </>
  );
}
