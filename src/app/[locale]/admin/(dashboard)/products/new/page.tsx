import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { ProductForm } from "@/app/[locale]/admin/(dashboard)/products/_components/ProductForm";
import { resolveLocale } from "@/features/core/domain/value-objects";

/**
 * /admin/products/new
 * Create a new product with the redesigned ProductForm.
 */
export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);

  const [categories, brands, tags] = await Promise.all([
    container.adminCategoryService.getAll(resolvedLocale),
    container.adminBrandService.getAll(true),
    container.adminTagService.getAll(),
  ]);

  return <ProductForm categories={categories} brands={brands} tags={tags} locale={locale} />;
}
