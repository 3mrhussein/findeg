import { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getDashboardData } from "@findeg/backend";
import { requireAuth } from "@lib/auth-guard";
import { DashboardContent } from "./_components/DashboardContent";
import { PermissionsProvider } from "@providers/PermissionsProvider";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 * Dashboard Page
 *
 * Wraps DashboardContent with PermissionsProvider so all child components
 * can call usePermissions() to check the current admin's access rights.
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAuth(locale);
  const data = await getDashboardData(locale, session.userId);

  return (
    <PermissionsProvider session={data.session as any}>
      <DashboardContent
        products={data.products}
        orders={data.orders}
        schoolLists={data.schoolLists}
      />
    </PermissionsProvider>
  );
}
