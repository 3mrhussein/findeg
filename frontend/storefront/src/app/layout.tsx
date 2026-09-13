import type { ReactNode } from 'react';
import { Inter, Cairo } from 'next/font/google';
import { cn } from '@lib/utils';
import { getLocale } from 'next-intl/server';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  variable: '--font-inter',
});

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '900'],
  variable: '--font-cairo',
});

export default async function RootLayout({ children }: { children: ReactNode }) {
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
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans antialiased"
      >
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
