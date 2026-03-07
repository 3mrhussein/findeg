import { getServices } from "@/server/getServices";
import { ProductForm } from "../../ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { Suspense } from "react";

/**
 *
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const resolvedLocale = resolveLocale(locale);
  const { adminProduct, categories, adminBrand } = getServices();
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const categoriesPromise = categories
    .getAll(resolvedLocale)
    .then((c) => c.map((x) => ({ id: x.id, slug: x.slug, name: x.name })));

  const brandsPromise = adminBrand.getAll().then((b) => b.map((x) => ({ id: x.id, name: x.name })));

  const product = await adminProduct.getByIdWithTranslations(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-2xl">
            {/* Added: div wrapper */}
            <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-lg bg-muted" />}>
              <ProductForm
                initialData={product}
                categoriesPromise={categoriesPromise}
                brandsPromise={brandsPromise}
              />
            </Suspense>
            {/* Modified: Added brands prop */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
