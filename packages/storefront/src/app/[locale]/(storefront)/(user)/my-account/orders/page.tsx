import { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@ui";
import { getMyAccountData } from "@backend/features/identity/application/queries/my-account";
import { SectionStateEmpty } from "@components/shared/state/SectionStateEmpty";

type Props = {
  params: Promise<{ locale: Locale }>;
};

/**
 * All Orders Page
 */
export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const userId = 1;
  const { orders } = await getMyAccountData(userId);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t("Pages.MyAccount.Orders")}</h1>
        <p className="text-muted-foreground">View and track all your past orders.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {orders.length === 0 ? (
            <SectionStateEmpty
              title={t("Pages.MyAccount.NoOrders")}
              description={t("Pages.MyAccount.NoOrders")}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orders.map((order: any) => (
                <Link
                  key={String(order.id)}
                  href={`/my-account/orders/${order.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-primary">#{order.id}</span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary uppercase">
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t("Pages.MyAccount.OrderDate")}:</span>
                      <span className="text-foreground">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(locale)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("Pages.MyAccount.OrderTotal")}:</span>
                      <span className="text-foreground font-medium">
                        {order.currency || "EGP"} {(order.totalAmount ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
