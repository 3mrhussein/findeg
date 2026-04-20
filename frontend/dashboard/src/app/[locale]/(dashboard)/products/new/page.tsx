import { getAllCategories, getAllBrands, getAllTags } from "@data/resources/queries";
import { ProductForm } from "@/app/[locale]/(dashboard)/products/_components/ProductForm";
import { resolveLocale } from "@findeg/backend/features/core";

/**
 * /admin/products/new
 * Create a new product with the redesigned ProductForm.
 */
export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = resolveLocale(locale);

  const [categories, brands, tags] = await Promise.all([
    getAllCategories(resolvedLocale),
    getAllBrands(true),
    getAllTags(),
  ]);

  return <ProductForm categories={categories} brands={brands} tags={tags} locale={locale} />;
}
