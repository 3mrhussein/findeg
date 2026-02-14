import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { hasLocale, Locale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import Providers from "@/providers/Providers";
import { Suspense } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "FindEg.com - Modern E-commerce Platform",
    template: "%s | FindEg.com",
  },
  description:
    "Your one-stop shop for stationary, kids toys, and school supplies. Find the best deals on high-quality products.",
  keywords: ["ecommerce", "stationary", "toys", "school supplies", "online shopping", "FindEg"],
  authors: [{ name: "FindEg Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://findeg.com",
    siteName: "FindEg.com",
    title: "FindEg.com - Modern E-commerce Platform",
    description: "Your one-stop shop for stationary, kids toys, and school supplies.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FindEg.com",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FindEg.com - Modern E-commerce Platform",
    description: "Your one-stop shop for stationary, kids toys, and school supplies.",
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
  const messages = await getMessages();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Suspense>
              <div className="min-h-screen bg-background text-foreground flex flex-col">
                {children}
              </div>
            </Suspense>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
