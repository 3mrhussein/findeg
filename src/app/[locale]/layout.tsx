import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { Providers } from '@/presentation/shared/providers/Providers';
import '../globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: 'FindEg.com - Modern E-commerce Platform',
    template: '%s | FindEg.com',
  },
  description: 'Your one-stop shop for stationary, kids toys, and school supplies. Find the best deals on high-quality products.',
  keywords: ['ecommerce', 'stationary', 'toys', 'school supplies', 'online shopping', 'FindEg'],
  authors: [{ name: 'FindEg Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://findeg.com',
    siteName: 'FindEg.com',
    title: 'FindEg.com - Modern E-commerce Platform',
    description: 'Your one-stop shop for stationary, kids toys, and school supplies.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FindEg.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindEg.com - Modern E-commerce Platform',
    description: 'Your one-stop shop for stationary, kids toys, and school supplies.',
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
 * 
 * @param {React.ReactNode} children - The content to render within the layout.
 */
import { NextIntlClientProvider } from 'next-intl';
import { getLocaleMessages } from '@/i18n/content';
import { routing } from '@/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ [key: string]: string | undefined }>;
}) {
  const { locale } = (await params) as { locale: string };
  const messages = getLocaleMessages(locale as any);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              {children}
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
