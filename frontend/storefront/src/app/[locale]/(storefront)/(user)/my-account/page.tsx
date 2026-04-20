import { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { logoutAction } from "../../_actions/auth";
import { updateProfileAction } from "../../_actions/user";
import { getMyAccountData } from "@findeg/backend/features/identity/application/queries/my-account";
import { SectionStateEmpty } from "@components/shared/state/SectionStateEmpty";
import { Input } from "@findeg/ui";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ profile?: string }>;
};

/**
 *
 */
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const { profile } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const userId = 1; // TODO: handle real session
  const { user, orders } = await getMyAccountData(userId);

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t("Pages.MyAccount.Title")}</h1>
        <p className="text-muted-foreground">
          {t("Pages.MyAccount.Welcome", { name: displayName })}
        </p>
      </div>

      {profile === "updated" ? (
        <p className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {t("Pages.MyAccount.ProfileUpdated")}
        </p>
      ) : null}
      {profile === "error" ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {t("Pages.MyAccount.ProfileUpdateError")}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("Pages.MyAccount.Profile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={updateProfileAction as any} className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                {t("Pages.MyAccount.NameLabel")}
              </label>
              <Input id="name" name="name" defaultValue={displayName} required minLength={2} />
              <Button type="submit">{t("Common.Save")}</Button>
            </form>
            <div>
              <span className="font-medium">{t("Pages.MyAccount.EmailLabel")}: </span>
              {user.email}
            </div>
            <form action={logoutAction as any}>
              <Button variant="destructive" type="submit">
                {t("Pages.MyAccount.Logout")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Pages.MyAccount.Orders")}</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <SectionStateEmpty
                title={t("Pages.MyAccount.NoOrders")}
                description={t("Pages.MyAccount.NoOrders")}
              />
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 8).map((order: any) => (
                  <Link
                    key={String(order.id)}
                    href={`/my-account/orders/${order.id}`}
                    data-testid={`my-account-order-card-${order.id}`}
                    className="block rounded-md border p-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {t("Pages.MyAccount.OrderId")}: #{order.id}
                      </span>
                      <span className="text-sm text-muted-foreground">{order.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("Pages.MyAccount.OrderDate")}:{" "}
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                    </div>
                    <div className="mt-1 text-sm">
                      {t("Pages.MyAccount.OrderTotal")}: {order.currency || "EGP"}{" "}
                      {(order.totalAmount ?? order.total ?? 0).toFixed(2)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
