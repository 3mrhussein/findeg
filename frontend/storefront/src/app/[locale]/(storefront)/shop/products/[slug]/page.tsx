import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound, permanentRedirect } from 'next/navigation';
import { Link } from '@i18n/navigation';
import env from '@findeg/env';
import {
  getProductPdp,
  getProductBySlugOrIdForMetadata,
  getTopProductSlugsForStaticParams,
} from '@data/catalog/queries';
import { PageShell } from '../../../_components/PageShell';
import { ProductDetailClient } from './_components/ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * Pre-renders top PDP slugs.
 */
export async function generateStaticParams() {
  const slugs = await getTopProductSlugsForStaticParams(120);
  return slugs.map((slug: string) => ({ slug }));
}

/**
 * PDP SEO metadata.
 */
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlugOrIdForMetadata(locale, slug);

  if (!product) {
    return {
      title: 'Product',
      description: 'FindEg school and stationery products.',
    };
  }

  const description = (product.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const canonicalSlug = product.slug || String(product.id);

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/${locale}/shop/products/${canonicalSlug}`,
    },
  };
}

import { getSession } from '@lib/session';

// ... (imports)

/**
 * Canonical PDP route: /shop/products/[slug].
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const session = await getSession();
  const vm = await getProductPdp(locale, slug, session);
  if (!vm) {
    notFound();
  }

  if (vm.shouldRedirect) {
    permanentRedirect(`/${locale}${vm.canonicalPath}`);
  }

  const imageUrls = (vm.selectedVariant?.images || [])
    .map((image: any) => image.url)
    .filter((url: any): url is string => Boolean(url));
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: vm.product.name,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    sku: vm.selectedVariant?.sku || vm.product.skuPrefix || undefined,
    brand: vm.brand ? { '@type': 'Brand', name: vm.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EGP',
      price: String(vm.selectedVariant?.basePrice || 0),
      availability: vm.stockSnapshot.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/${locale}${vm.canonicalPath}`,
    },
    aggregateRating:
      vm.reviewSummary.totalReviews > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: vm.reviewSummary.averageRating,
            reviewCount: vm.reviewSummary.totalReviews,
          }
        : undefined,
  };

  return (
    <PageShell>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {vm.breadcrumbs.map((item: any, index: number) => {
          const isLast = index === vm.breadcrumbs.length - 1;
          return (
            <div key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-semibold text-foreground' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span>/</span> : null}
            </div>
          );
        })}
      </nav>

      <ProductDetailClient vm={vm} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </PageShell>
  );
}
