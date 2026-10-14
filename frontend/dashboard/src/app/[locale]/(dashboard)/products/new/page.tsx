import { getAllCategories, getAllBrands, getAllTags } from '@data/resources/queries';
import { ProductForm } from '@/app/[locale]/(dashboard)/products/_components/ProductForm';
import { parse } from '@findeg/catalog';
import { PERMISSION_CODES } from '@findeg/backend/features/core/schemas';
import { requirePermission } from '@lib/auth-guard';
import type { Locale } from '@findeg/domain';

/**
 * /admin/products/new
 * Create a new product with the redesigned ProductForm.
 */
export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requirePermission(locale as Locale, { permission: PERMISSION_CODES.ADMIN_PRODUCTS_WRITE });
  const resolvedLocale = parse(locale);

  const [categories, brands, tags] = await Promise.all([
    getAllCategories(resolvedLocale),
    getAllBrands(true),
    getAllTags(),
  ]);

  return <ProductForm categories={categories} brands={brands} tags={tags} locale={locale} />;
}
