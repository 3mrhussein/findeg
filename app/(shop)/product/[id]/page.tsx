import { Suspense } from 'react';
import ProductDetailPage from '@/views/ProductDetailPage';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailPage productId={parseInt(id)} />
    </Suspense>
  );
}
