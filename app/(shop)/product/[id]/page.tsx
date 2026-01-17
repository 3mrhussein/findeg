import { Suspense } from 'react';
import ProductDetailTemplate from '@/components/templates/ProductDetailTemplate';
import { products } from '@/lib/constants';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailTemplate productId={parseInt(id)} />
    </Suspense>
  );
}
