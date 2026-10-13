import { type Locale } from '@findeg/domain';
import React from 'react';
import { SchoolListLayout } from './_components/SchoolListLayout';
import { setRequestLocale } from 'next-intl/server';

/**
 *
 */
export default async function ListLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <SchoolListLayout locale={locale}>{children}</SchoolListLayout>;
}
