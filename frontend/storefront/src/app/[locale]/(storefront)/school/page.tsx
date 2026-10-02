import { Container } from '@findeg/ui';
import { FadeIn } from '@providers/animation-provider';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import type { Locale } from 'next-intl';
import { SchoolListLookupForm } from './_components/SchoolListLookupForm';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';

interface SchoolPageProps {
  params: Promise<{ locale: string }>;
}

/** Wraps the async inner page in a Suspense boundary for PPR compliance. */
export default function SchoolPage(props: SchoolPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex justify-center">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SchoolPageInner {...props} />
    </Suspense>
  );
}

/** Async inner page: opens a School Supply List from its code or share link. */
async function SchoolPageInner({ params }: SchoolPageProps) {
  const { locale } = await params;
  const resLocale = locale as Locale;
  setRequestLocale(resLocale);
  const t = await getTranslations({ locale: resLocale });

  return (
    <div className="bg-background py-12 md:py-20">
      <Container>
        <FadeIn className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t('Pages.SchoolLists.Title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('Pages.SchoolLists.Subtitle')}
          </p>
        </FadeIn>

        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Pages.SchoolLists.FormTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SchoolListLookupForm />
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
