import { Locale } from "next-intl";
import CategoriesTemplate from "./CategoriesTemplate";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 *
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CategoriesTemplate />;
}
