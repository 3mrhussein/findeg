import React, { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { CategoryQuickNav } from "@/components/layout/CategoryQuickNav";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Chatbot } from "@/components/common/Chatbot";
import { ShopClientLayout } from "@/components/layout/ShopClientLayout";
import { Footer } from "@/components/layout/Footer";
import type { Locale } from "next-intl";

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

  return (
    <>
      <AnnouncementBar />
      <Suspense fallback={<div className="h-16 border-b bg-background/95" />}>
        <Header locale={typedLocale} />
      </Suspense>
      <Suspense fallback={<div className="h-12 border-b bg-muted/30" />}>
        <CategoryQuickNav locale={typedLocale} />
      </Suspense>
      <main className="flex-grow">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer locale={typedLocale} />
      </Suspense>
      <ShopClientLayout />
      <Chatbot />
    </>
  );
}
