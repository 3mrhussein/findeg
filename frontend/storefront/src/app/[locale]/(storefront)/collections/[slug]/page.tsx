import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import type { Locale } from 'next-intl';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { parse } from '@findeg/backend/features/core/domain/value-objects';
import { getCollectionPageViewModel } from '@/data/catalog/queries';
import { PageShell } from '../../_components/PageShell';
import { ProductListingLayout } from '../../_components/ProductListingLayout';

interface CollectionPageProps {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 *
 */
export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CollectionPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

/**
 *
 */
async function CollectionPageContent({ params, searchParams }: CollectionPageProps) {
  const { slug, locale } = await params;
  const resolvedLocale = parse(locale);
  setRequestLocale(resolvedLocale);
  const query = await searchParams;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'Pages.Shop' });

  const vm = await getCollectionPageViewModel(slug, locale, query);
  if (!vm) notFound();

  const { collection } = vm;
  const title =
    (collection.localizedTitle as Record<string, string>)?.[resolvedLocale] || collection.slug;
  const subtitle = (collection.localizedSubtitle as Record<string, string>)?.[resolvedLocale];

  return (
    <PageShell>
      {/* Collection Hero Banner */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-primary mb-10 lg:mb-12">
        <div className="absolute inset-0 opacity-40 mix-blend-multiply">
          <Image
            src={collection.heroImageUrl || `https://picsum.photos/seed/${collection.id}/1200/400`}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 to-slate-900/20" />
        <div className="relative z-10 p-10 lg:p-16 flex flex-col justify-center min-h-[240px]">
          <div className="inline-flex items-center w-fit rounded bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md mb-4">
            {t('CollectionBadge')}
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-slate-200 max-w-2xl leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>

      <ProductListingLayout
        {...vm}
        resultsCountLabel={t('ShowingResults', {
          count: (vm.filteredProducts || vm.products).length,
          total: vm.products.length,
        })}
        filtersTitle={t('FiltersTitle')}
        noProductsTitle={title}
        noProductsDescription={t('NoProductsDescription')}
        loadMoreLabel={t('LoadMore')}
      />
    </PageShell>
  );
}
