import { Suspense, type ReactNode } from 'react';
import localFont from 'next/font/local';
import { cn } from '@lib/utils';
import { getLocale } from 'next-intl/server';

const inter = localFont({
  src: [
    {
      path: './fonts/inter-latin.woff2',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = localFont({
  src: [
    {
      path: './fonts/cairo-arabic.woff2',
      style: 'normal',
    },
    {
      path: './fonts/cairo-latin.woff2',
      style: 'normal',
    },
  ],
  variable: '--font-cairo',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <html lang="en">
          <body />
        </html>
      }
    >
      <LocalizedDocument>{children}</LocalizedDocument>
    </Suspense>
  );
}

async function LocalizedDocument({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn(inter.variable, cairo.variable)}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background font-sans antialiased">
        <div
          className={cn(
            'flex min-h-screen flex-col',
            locale === 'ar' ? 'font-arabic' : 'font-inter',
          )}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
