import { getServices } from "@/server/getServices";
import { ProductForm } from "@/features/administration/presentation/components/catalog/ProductForm";
import { toProductFormValues } from "@/features/administration/presentation/mappers/product-form-mapper";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/features/core/domain/value-objects";
import type { ProductFormValues } from "@/features/administration/presentation/components/catalog/ProductForm/types";

/**
 * /admin/products/[id]/edit
 * Edit an existing product with the redesigned ProductForm.
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

  if (isNaN(productId)) notFound();

  const [categoriesRaw, brandsRaw, product] = await Promise.all([
    categories.getAll(resolvedLocale),
    adminBrand.getAll(),
    adminProduct.getById(productId, resolvedLocale),
  ]);

  if (!product) notFound();

  const mappedCategories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));
  const mappedBrands = brandsRaw.map((b) => ({ id: b.id, name: b.name }));

  const initialData = toProductFormValues(product);

  return (
    <div className="flex-1 space-y-6 p-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Edit Product #{productId}</h1>
          <p className="text-sm text-muted-foreground">
            Modify product details, variants, pricing, and units of measure.
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ProductForm
          mode="edit"
          productId={productId}
          initialData={initialData}
          categories={mappedCategories}
          brands={mappedBrands}
        />
      </div>
    </div>
  );
}
