import { redirect, notFound } from 'next/navigation';
import { getProductBySlugOrIdForMetadata } from '@/data/catalog/queries';

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const product = await getProductBySlugOrIdForMetadata(locale, slug);
  if (!product) notFound();
  redirect(`/${locale}/shop/products/${product.slug || slug}`);
}
