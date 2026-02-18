import { Locale } from "next-intl";
import DashboardTemplate from "./DashboardTemplate";
import { setRequestLocale } from "next-intl/server";
import { getDashboardDataOrRedirect } from "@/features/identity/application/queries/dashboard";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 *
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await getDashboardDataOrRedirect(locale);

  return <DashboardTemplate products={data.products} orders={data.orders} />;
}
