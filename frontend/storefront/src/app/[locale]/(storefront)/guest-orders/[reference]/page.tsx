import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle, Container, Separator } from '@findeg/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from 'next-intl';
import { redirect } from '@i18n/navigation';
import {
  GUEST_ORDER_COOKIE,
  createGuestAccessService,
} from '@findeg/backend/features/guest-access';

interface GuestOrderPageProps {
  params: Promise<{ locale: Locale; reference: string }>;
}

/** Shows one Order, only to a visitor holding the signed cookie issued for that very reference. */
export default async function GuestOrderPage({ params }: GuestOrderPageProps) {
  const { locale, reference } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Pages.GuestOrder' });

  const token = (await cookies()).get(GUEST_ORDER_COOKIE)?.value;
  const order = await createGuestAccessService().getOrder(token, decodeURIComponent(reference));
  if (!order) return redirect({ href: '/order-lookup', locale });

  const money = (amount: string | null) => `${order.currency} ${Number(amount ?? 0).toFixed(2)}`;

  return (
    <main className="bg-background py-10 md:py-14">
      <Container className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold" data-testid="guest-order-heading">
          {t('OrderTitle', { reference: order.orderReference })}
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>{t('Status')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p>{order.status}</p>
            <p className="text-sm text-muted-foreground">
              {t('Placed')}: {new Date(order.createdAt).toLocaleString(locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('Items')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>
                  {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                </span>
                <span>{money(item.totalPrice)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span>{t('Shipping')}</span>
              <span>{money(order.shippingCost)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>{t('Total')}</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
