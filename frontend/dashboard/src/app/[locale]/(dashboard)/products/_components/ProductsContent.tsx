/**
 * ProductsContent Component
 *
 * Server component that fetches and displays products catalog.
 * Used within Suspense boundaries in products page for progressive rendering.
 */

import { parse } from '@findeg/backend/features/core';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/app/[locale]/_components/shared/PageHeader';
import { Button } from '@findeg/ui';
import { Link } from '@i18n/navigation';
import { Plus } from 'lucide-react';
import { ProductsClient } from './ProductsClient';
import { getProducts } from '@data/products/queries';
import { getAllCategories } from '@data/resources/queries';
import { getAllBrands } from '@data/resources/queries';
import { ProductListFilters } from '@findeg/backend/features/administration/application/interfaces/IAdminProductService';

interface ProductsContentProps {
  locale: string;
  filters: ProductListFilters;
}

export async function ProductsContent({ locale, filters }: ProductsContentProps) {
  const resolvedLocale = parse(locale);
  const t = await getTranslations('Administration.Catalog.Products');

  // Fetch data from data layer
  const [initialData, categories, brands] = await Promise.all([
    getProducts(resolvedLocale, filters),
    getAllCategories(resolvedLocale),
    getAllBrands(false, resolvedLocale),
  ]);

  return (
    <>
      <PageHeader
        title={t('Title')}
        description={`${initialData.total || 0} products in catalog`}
        actions={
          <Button asChild>
            <Link href={`/products/new`}>
              <Plus className="h-4 w-4 me-2" />
              {t('AddProduct')}
            </Link>
          </Button>
        }
      />

      <ProductsClient
        initialData={initialData}
        categories={categories}
        brands={brands}
        initialFilters={filters}
      />
    </>
  );
}
