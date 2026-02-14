import { Locale } from "next-intl";
import RegistrationTemplate from "./RegistrationTemplate";
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

  return <RegistrationTemplate />;
}
