import { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getDashboardDataOrRedirect } from "@/features/identity/application/queries/dashboard";
import { DashboardContent } from "./_components/DashboardContent";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 * Dashboard Page
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = await getDashboardDataOrRedirect(locale);

  return <DashboardContent products={data.products} orders={data.orders} />;
}
