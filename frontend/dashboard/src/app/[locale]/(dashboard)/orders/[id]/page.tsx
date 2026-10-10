import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getOrderDetail } from '@data/orders/queries';
import { Button } from '@findeg/ui';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@i18n/navigation';
import { OrderHeader } from './_components/OrderHeader';
import { OrderTimeline } from './_components/OrderTimeline';
import { OrderItemsTable } from './_components/OrderItemsTable';
import { OrderTotals } from './_components/OrderTotals';
import { OrderCustomerInfo } from './_components/OrderCustomerInfo';
import { OrderPaymentFulfillment } from './_components/OrderPaymentFulfillment';
import { OrderActivityLog } from './_components/OrderActivityLog';

/**
 * Admin Order Detail Page
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Order ids are positive 32-bit integers; anything else cannot name an Order.
  if (!/^[1-9]\d{0,9}$/.test(id) || Number(id) > 2_147_483_647) notFound();

  const detail = await getOrderDetail(Number(id));
  if (!detail) notFound();
  const { order, activity: logs } = detail;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 pb-20">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <OrderHeader order={order} />
      <OrderTimeline status={order.status} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - 65% width on xl screens */}
        <div className="xl:col-span-2 space-y-6">
          <OrderItemsTable items={order.items || []} currency={order.currency || 'EGP'} />
          <OrderTotals order={order} />

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Activity Timeline</h3>
            <OrderActivityLog logs={logs} />
          </div>
        </div>

        {/* Right Column - 35% width on xl screens */}
        <div className="space-y-6 flex flex-col">
          <OrderPaymentFulfillment order={order} />
          <OrderCustomerInfo order={order} />
        </div>
      </div>
    </div>
  );
}
