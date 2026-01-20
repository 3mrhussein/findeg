import { Suspense } from 'react';
import ProductDetailTemplate from '@/presentation/templates/ProductDetailTemplate';
import { products } from '@/lib/constants';

import { routing } from '@/i18n/routing';

export async function generateStaticParams() {
  const locales = ['en', 'ar'];
  const params = [];
  for (const locale of locales) {
    for (const product of products) {
      params.push({
        locale,
        id: product.id.toString(),
      });
    }
  }
  return params;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailTemplate productId={parseInt(id)} />
    </Suspense>
  );
}
