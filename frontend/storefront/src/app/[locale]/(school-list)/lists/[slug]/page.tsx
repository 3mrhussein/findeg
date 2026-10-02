import { getSchoolListPageData } from '@/data/school/queries';
import { SessionState } from '@findeg/backend';
import { getOptionalSession } from '@lib/auth-guard';
import { SchoolAuthWall } from '@app/[locale]/(storefront)/school/_components/SchoolAuthWall';
import { notFound } from 'next/navigation';
import { redirect } from '@i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from 'next-intl';
import { ListPageClient } from './ListPageClient';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * /lists/[slug]
 *
 * Direct List URL (Customized Parent Experience).
 */
export default function DirectListPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DirectListContent params={params} />
    </Suspense>
  );
}

/**
 *
 */
async function DirectListContent({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const session = await getOptionalSession();

  if (!session) {
    return <SchoolAuthWall listTitle={slug.replace(/-/g, ' ')} />;
  }

  const pageData = await getSchoolListPageData(slug, session?.userId || null);
  if (!pageData) return notFound();

  const { list, accessState, sessionState, fullList } = pageData;

  // 2. Final Access Verification
  if (accessState !== 'granted' && accessState !== 'public') {
    const schoolSlug = list.schoolName.toLowerCase().replace(/\s+/g, '-');
    redirect({ href: `/schools/${schoolSlug}?restricted=${list.id}`, locale });
  }

  return (
    <ListPageClient
      list={fullList}
      initialSessionState={sessionState as SessionState}
      sessionUser={session}
    />
  );
}
