import React, { Suspense } from "react";
import { Header } from "@/components/shared/Header";
import { CategoryQuickNav } from "@/components/shared/CategoryQuickNav";
import { AnnouncementBar } from "./_components/AnnouncementBar";
import { Chatbot } from "./_components/Chatbot";
import { ShopClientLayout } from "./_components/ShopClientLayout";
import { Footer } from "@/components/shared/Footer";
import type { Locale } from "next-intl";
import Navbar from "@/components/shared/Navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getServices } from "@/server/getServices";
import { getHeaderCategoryTree } from "@/features/catalog/application/queries/header-nav";
import { AppSidebar } from "@/components/shared/AppSidebar";

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
  const { auth } = getServices();

  const [categories, session] = await Promise.all([
    getHeaderCategoryTree(locale),
    auth.getSession(),
  ]);

  return (
    <>
      <AnnouncementBar />
      <SidebarProvider>
        <AppSidebar categories={categories} user={session} />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <Suspense fallback={<div className="h-16 border-b bg-background/95" />}>
            <Header locale={typedLocale} />
          </Suspense>
          <Suspense fallback={<div className="h-12 border-b bg-muted/30" />}>
            <CategoryQuickNav locale={typedLocale} />
          </Suspense>
          <Suspense fallback={null}>{children}</Suspense>
        </SidebarInset>
      </SidebarProvider>
      <Suspense fallback={null}>
        <Footer locale={typedLocale} />
      </Suspense>
      <ShopClientLayout />
      <Chatbot />
    </>
  );
}
