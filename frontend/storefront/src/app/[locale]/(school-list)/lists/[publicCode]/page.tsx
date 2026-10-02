import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from 'next-intl';
import { createSchoolSupplyListReader } from '@findeg/backend/features/school';
import { SupplyListView } from './_components/SupplyListView';

interface PageProps {
  params: Promise<{ locale: string; publicCode: string }>;
}

/**
 * /lists/[publicCode]
 *
 * Opens a published or archived School Supply List. Possession of the code is
 * the only gate: no login wall, and the read is live (never cached).
 */
export default function PublicListPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen justify-center py-16">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <PublicListContent params={params} />
    </Suspense>
  );
}

async function PublicListContent({ params }: PageProps) {
  const { locale, publicCode } = await params;
  setRequestLocale(locale as Locale);
  await connection();

  const result = await createSchoolSupplyListReader().getByPublicCode(publicCode);
  if (!result.success) notFound();

  return <SupplyListView list={result.data} locale={locale} />;
}
