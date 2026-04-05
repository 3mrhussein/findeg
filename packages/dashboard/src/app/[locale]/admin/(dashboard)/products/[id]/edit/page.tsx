import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { ProductForm } from "../../_components/ProductForm";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/features/core/domain/value-objects";

/**
 * /admin/products/[id]/edit
 * Edit an existing product with the redesigned tabbed ProductForm.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const resolvedLocale = resolveLocale(locale);
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  const [categories, brands, tags, product] = await Promise.all([
    container.adminCategoryService.getAll(resolvedLocale),
    container.adminBrandService.getAll(true),
    container.adminTagService.getAll(),
    container.adminProductService.getProductForEdit(productId),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      initialData={product}
      categories={categories}
      brands={brands}
      tags={tags}
      locale={locale}
    />
  );
}
