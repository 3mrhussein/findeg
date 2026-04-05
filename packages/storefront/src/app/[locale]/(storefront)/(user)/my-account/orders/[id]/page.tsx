import { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { Separator } from "@findeg/ui";
import { getMyOrderDetail } from "@/features/identity/application/queries/my-account";

interface MyOrderDetailPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

/**
 *
 */
export default async function MyOrderDetailPage({ params }: MyOrderDetailPageProps) {
  const { locale, id: idParam } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const orderId = Number(idParam);
  if (!Number.isFinite(orderId)) notFound();

  const userId = 1;
  const order = await getMyOrderDetail(orderId, userId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" data-testid="my-account-order-detail-heading">
          {t("Pages.MyAccount.OrderId")}: #{order.id}
        </h1>
        <Button asChild variant="outline">
          <Link href="/my-account">{t("Pages.MyAccount.Title")}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Pages.MyAccount.OrderStatus")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{order.status}</p>
          <p className="text-sm text-muted-foreground">
            {t("Pages.MyAccount.OrderDate")}:{" "}
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Pages.MyAccount.Orders")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items?.map((item: any, index: number) => (
            <div key={`${item.productId}-${index}`} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.productNameSnapshot || item.productName || "-"}</p>
                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {order.currency || "EGP"}{" "}
                {(item.unitPrice ?? item.unitPriceSnapshot ?? item.price ?? 0).toFixed(2)}
              </p>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>{t("Pages.MyAccount.OrderTotal")}</span>
            <span>
              {order.currency || "EGP"} {(order.totalAmount ?? order.total ?? 0).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
