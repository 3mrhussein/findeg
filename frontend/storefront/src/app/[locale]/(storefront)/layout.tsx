import React, { Suspense } from 'react';
import { Navbar } from '@components/layout/Navbar';
import { Footer } from '@components/shared/Footer';
import { CartDrawer } from './_components/CartDrawer';
import type { Locale } from 'next-intl';

import { setRequestLocale } from 'next-intl/server';

/**
 *
 */
export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <Suspense fallback={null}>{children}</Suspense>
      <Suspense fallback={null}>
        <Footer locale={typedLocale} />
      </Suspense>
      <CartDrawer />
    </>
  );
}
