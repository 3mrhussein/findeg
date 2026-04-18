import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import Providers from "@/providers/Providers";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@ui";
import { routing } from "@i18n/routing";
import { notFound } from "next/navigation";
import { type Locale } from "@backend/features/core";
import "../globals.css";

/**
 * Generate static params for all supported locales
 */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Shared layout for all locale-specific routes.
 * Handles the HTML structure, dynamic lang/dir attributes,
 * and provides the i18n context along with global app providers.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate request locale
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages for the current locale on the server to pass to client components
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
