import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { hasLocale, Locale, NextIntlClientProvider } from 'next-intl';
import { routing } from '@i18n/routing';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import Providers from '@providers/Providers';
import { Suspense } from 'react';
import { BoundaryProvider } from '@lib/internal/BoundaryProvider';
import BoundaryToggle from '@lib/internal/BoundaryToggle';
import { WebMCPInitializer } from '@components/shared/WebMCPInitializer';
import { LocaleSync } from '@components/shared/LocaleSync';
import { cn } from '@lib/utils';

export const metadata: Metadata = {
  title: {
    default: 'FindEg - School & Stationery Marketplace',
    template: '%s | FindEg',
  },
  description:
    'Storefront-first marketplace for stationery, school supplies, and educational essentials in Egypt.',
  keywords: ['ecommerce', 'stationery', 'school supplies', 'online shopping', 'FindEg'],
  authors: [{ name: 'FindEg Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://findeg.com',
    siteName: 'FindEg',
    title: 'FindEg - School & Stationery Marketplace',
    description: 'Storefront-first marketplace for stationery and school supplies.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FindEg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindEg - School & Stationery Marketplace',
    description: 'Storefront-first marketplace for stationery and school supplies.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#14b8a6' },
    { media: '(prefers-color-scheme: dark)', color: '#14b8a6' },
  ],
};

/**
 * The root layout component for the application.
 *
 * This component wraps all pages and provides the base HTML structure,
 * including the `html` and `body` tags. It also wraps the application
 * with global providers (theme, context, etc.) and applies global styles.
 */

/** Returns pre-defined locale params for static generation. */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Root layout providing HTML structure, i18n, fonts, and global providers.
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  if (!hasLocale(routing.locales, typedLocale)) {
    notFound();
  }
  // Enable static rendering
  setRequestLocale(typedLocale);
  const messages = await getMessages({ locale: typedLocale });

  return (
    <NextIntlClientProvider locale={typedLocale} messages={messages}>
      <LocaleSync />
      <BoundaryProvider>
        <Providers>

          <Suspense fallback={null}>{children}</Suspense>
          {/* <BoundaryToggle /> */}
          <WebMCPInitializer />
        </Providers>
      </BoundaryProvider>
    </NextIntlClientProvider>
  );
}
