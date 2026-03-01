import React, { Suspense } from "react";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CartDrawer } from "./_components/CartDrawer";
import type { Locale } from "next-intl";

import { setRequestLocale } from "next-intl/server";

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
      <Header locale={typedLocale} />
      <Suspense fallback={null}>{children}</Suspense>
      <Footer locale={typedLocale} />
      <CartDrawer />
    </>
  );
}
