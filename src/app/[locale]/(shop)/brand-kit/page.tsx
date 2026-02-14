import { Locale } from "next-intl";
import BrandKitTemplate from "./BrandKitTemplate";
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

  return <BrandKitTemplate />;
}
