import { ProductForm } from '../../_components/ProductForm';
import { notFound } from 'next/navigation';
import { parse } from '@findeg/backend/features/core';
import { getProductForEdit } from '@data/products/queries';
import { getAllCategories, getAllBrands, getAllTags } from '@data/resources/queries';

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

  // Fetch data in parallel
  const [product, categories, brands, tags] = await Promise.all([
    getProductForEdit(productId),
    getAllCategories(resolvedLocale),
    getAllBrands(false, resolvedLocale),
    getAllTags(resolvedLocale),
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
