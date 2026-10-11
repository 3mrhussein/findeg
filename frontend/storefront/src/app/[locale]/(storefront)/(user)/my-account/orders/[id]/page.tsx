import { OrderSnapshotTotals } from '@components/orders/OrderSnapshotTotals';
import { piastersToEgp } from '@findeg/money';
import { Locale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Separator } from '@findeg/ui';
import { getCustomerOrder } from '@data/order/queries';
import { requireAuth } from '@lib/auth-guard';

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
  if (!Number.isSafeInteger(orderId) || orderId <= 0) notFound();

  const session = await requireAuth(locale);
  const order = await getCustomerOrder(session, orderId);
  if (!order) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" data-testid="my-account-order-detail-heading">
          {t('Pages.MyAccount.OrderId')}: #{order.id}
        </h1>
        <Button asChild variant="outline">
          <Link href="/my-account">{t('Pages.MyAccount.Title')}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Pages.MyAccount.OrderStatus')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{order.status}</p>
          <p className="text-sm text-muted-foreground">
            {t('Pages.MyAccount.OrderDate')}:{' '}
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Pages.MyAccount.Orders')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items?.map((item, index: number) => (
            <div key={`${item.productId}-${index}`} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.productNameSnapshot || '-'}</p>
                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
              </div>
              <dl className="mt-1 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <dt>{t('Pages.Checkout.UnitPrice')}</dt>
                  <dd>
                    {order.currency} {piastersToEgp(item.unitPrice)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t('Pages.Checkout.Discounts')}</dt>
                  <dd>
                    {order.currency} {piastersToEgp(item.discountAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t('Pages.Checkout.LineTotal')}</dt>
                  <dd>
                    {order.currency} {piastersToEgp(item.lineTotal)}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
          <Separator />
          <OrderSnapshotTotals
            {...order}
            labels={{
              subtotal: t('Pages.Checkout.Subtotal'),
              discount: t('Pages.Checkout.Discounts'),
              shipping: t('Pages.Checkout.Shipping'),
              total: t('Pages.MyAccount.OrderTotal'),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
