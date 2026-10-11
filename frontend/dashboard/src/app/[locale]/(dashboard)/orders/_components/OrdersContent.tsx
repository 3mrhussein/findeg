import { PageHeader } from '@/app/[locale]/_components/shared/PageHeader';
import { getOrders, getOrderStats } from '@data/orders/queries';
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@findeg/orders/schemas';
import type { OrderStatus, PaymentStatus } from '@findeg/orders/schemas';
import { OrderTable } from '../OrderTable';

interface OrdersContentProps {
  locale: string;
  filters: {
    page: number;
    limit: number;
    search: string;
    status?: string;
    paymentStatus?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

/**
 * OrdersContent - Handles order data fetching and display.
 * Separated to allow streaming with Suspense.
 */
export async function OrdersContent({ locale: _locale, filters }: OrdersContentProps) {
  const { page, limit, search, status, paymentStatus, startDate, endDate } = filters;
  const normalizedStatus = ORDER_STATUS_OPTIONS.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;
  const normalizedPaymentStatus = PAYMENT_STATUS_OPTIONS.includes(paymentStatus as PaymentStatus)
    ? (paymentStatus as PaymentStatus)
    : undefined;
  const [{ orders, total }, stats] = await Promise.all([
    getOrders({
      limit,
      offset: (page - 1) * limit,
      search: search || undefined,
      status: normalizedStatus,
      paymentStatus: normalizedPaymentStatus,
      startDate,
      endDate,
    }),
    getOrderStats(),
  ]);

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage customer orders and track fulfillment"
        count={total}
      />

      <OrderTable
        data={orders}
        page={page}
        limit={limit}
        total={total}
        statusCounts={stats.ordersByStatus}
        filters={{ search, status, paymentStatus, startDate, endDate }}
      />
    </>
  );
}
