import React from "react";
import { SchoolListLayout } from "@/app/[locale]/(storefront)/school/_components/SchoolListLayout";
import { setRequestLocale } from "next-intl/server";

/**
 *
 */
export default async function ListLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as "en" | "ar");

  return <SchoolListLayout locale={locale}>{children}</SchoolListLayout>;
}
