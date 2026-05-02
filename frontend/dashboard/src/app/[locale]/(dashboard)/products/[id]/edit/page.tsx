import { ProductForm } from "../../_components/ProductForm";
import { notFound } from "next/navigation";
import { parse } from "@findeg/backend/features/core";

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
  const resolvedLocale = parse(locale);
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  // TODO: Restore data fetching after repository-based refactoring
  const categories: any[] = [];
  const brands: any[] = [];
  const tags: any[] = [];
  const product = null; // Will trigger notFound()

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
