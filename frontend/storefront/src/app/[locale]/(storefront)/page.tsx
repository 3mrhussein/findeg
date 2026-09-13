import type { Metadata } from 'next';
import { Locale } from 'next-intl';
import HomePage from './HomePage';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildPageMetadata } from './_lib/metadata';
import { use } from 'react';

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 *
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Seo.Home' });
  return buildPageMetadata({
    title: t('Title'),
    description: t('Description'),
    keywords: t('Keywords')
      .split(',')
      .map((keyword) => keyword.trim()),
  });
}

/**
 *
 */
export default function Page({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <HomePage language={locale} />;
}
