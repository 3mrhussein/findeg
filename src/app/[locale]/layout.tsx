import type { Metadata, Viewport } from "next";
import { Inter, Cairo } from "next/font/google";
import "../globals.css";
import { hasLocale, Locale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import Providers from "@/providers/Providers";
import { Suspense } from "react";
import { BoundaryProvider } from "@/lib/internal/BoundaryProvider";
import BoundaryToggle from "@/lib/internal/BoundaryToggle";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: {
    default: "FindEg - School & Stationery Marketplace",
    template: "%s | FindEg",
  },
  description:
    "Storefront-first marketplace for stationery, school supplies, and educational essentials in Egypt.",
  keywords: ["ecommerce", "stationery", "school supplies", "online shopping", "FindEg"],
  authors: [{ name: "FindEg Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://findeg.com",
    siteName: "FindEg",
    title: "FindEg - School & Stationery Marketplace",
    description: "Storefront-first marketplace for stationery and school supplies.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FindEg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FindEg - School & Stationery Marketplace",
    description: "Storefront-first marketplace for stationery and school supplies.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14b8a6" },
    { media: "(prefers-color-scheme: dark)", color: "#14b8a6" },
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

/**
 *
 */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 *
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
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${cairo.variable} font-sans bg-background text-foreground`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={typedLocale} messages={messages}>
          <BoundaryProvider>
            <Providers>
              <div className="min-h-screen bg-background text-foreground flex flex-col">
                {children}
              </div>
              <BoundaryToggle />
            </Providers>
          </BoundaryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
