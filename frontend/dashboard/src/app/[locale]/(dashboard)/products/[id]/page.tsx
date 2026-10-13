import { Suspense } from 'react';
import { ProductDetailSkeleton } from '@components/skeletons';
import { ProductDetailContent } from './_components/ProductDetailContent';
import { PERMISSION_CODES } from '@findeg/backend/features/core/schemas';
import { requirePermission } from '@lib/auth-guard';
import type { Locale } from '@findeg/domain';

/**
 * Product Edit Page
 *
 * Displays product form with Suspense boundaries for progressive rendering.
 * Uses PPR (Partial Prerendering) for instant page navigation.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: idParam } = await params;
  await requirePermission(locale as Locale, { permission: PERMISSION_CODES.ADMIN_PRODUCTS_READ });
  const productId = parseInt(idParam);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent productId={productId} locale={locale} />
      </Suspense>
    </div>
  );
}
