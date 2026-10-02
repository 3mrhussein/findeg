import { getSchoolProfile } from '@/data/school/queries';
import { SchoolProfileLists } from './SchoolProfileLists';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Badge } from '@findeg/ui';
import { School, MapPin, GraduationCap, ShieldCheck } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * /schools/[slug]
 *
 * Partner School profile. `slug` is the school's Business Partner code. Shows
 * its published School Supply Lists, each linking to `/lists/<publicCode>`.
 */
export default function SchoolProfilePage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen justify-center py-16">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <SchoolProfileContent params={params} />
    </Suspense>
  );
}

async function SchoolProfileContent({ params }: PageProps) {
  const { slug } = await params;
  const [school, locale, t] = await Promise.all([
    getSchoolProfile(slug),
    getLocale(),
    getTranslations('School.Directory'),
  ]);

  if (!school) {
    notFound();
  }

  const name = locale === 'ar' ? school.nameAr : school.nameEn;
  const location = [school.area, school.governorate].filter(Boolean).join(', ');

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-3xl border shadow-xl bg-card">
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-primary/20 via-primary/5 to-transparent border-b" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-background rounded-2xl border-2 border-primary/10 flex items-center justify-center shadow-lg shrink-0">
            <School className="w-12 h-12 md:w-16 md:h-16 text-primary" />
          </div>

          <div className="grow space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {school.schoolType && (
                  <Badge variant="outline" className="text-primary font-bold">
                    {school.schoolType}
                  </Badge>
                )}
                {school.academicSystem && (
                  <Badge variant="secondary" className="font-semibold">
                    {school.academicSystem}
                  </Badge>
                )}
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 flex gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {t('verifiedSchool')}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">{name}</h1>
              {location && (
                <div className="flex items-center gap-2 text-muted-foreground text-lg">
                  <MapPin className="w-5 h-5" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GraduationCap className="w-5 h-5 text-primary/60" />
                {t('publishedListsCount', { count: school.lists.length })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-3xl font-black flex items-center gap-3">
              {t('supplyListsHeading')}
              <Badge variant="secondary" className="rounded-full">
                {school.lists.length}
              </Badge>
            </h2>
          </div>

          <SchoolProfileLists lists={school.lists} locale={locale} />
        </div>
      </div>
    </div>
  );
}
