import type { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SchoolListsTemplate from "./SchoolListsTemplate";
import { buildPageMetadata } from "../_lib/metadata";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 * SEO metadata for the optional school-list flow.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo.SchoolLists" });
  return buildPageMetadata({
    title: t("Title"),
    description: t("Description"),
    robots: { index: true, follow: true },
  });
}

/**
 *
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SchoolListsTemplate />;
}
