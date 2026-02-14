import SearchTemplate from "./SearchTemplate";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 *
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as any);

  return <SearchTemplate />;
}
