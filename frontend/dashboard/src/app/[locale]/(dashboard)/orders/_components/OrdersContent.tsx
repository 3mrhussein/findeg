import { PageHeader } from '@/app/[locale]/_components/shared/PageHeader';
import { createOrders } from '@findeg/backend/features/order';
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from '@findeg/backend/features/order/schemas';
import type { OrderStatus, PaymentStatus } from '@findeg/backend/features/core';
import { OrderTable } from '../OrderTable';

interface OrdersContentProps {
  locale: string;
  filters: {
    page: number;
    limit: number;
    search: string;
    status?: string;
    paymentStatus?: string;
    from?: string;
    to?: string;
  };
}

/**
 * OrdersContent - Handles order data fetching and display.
 * Separated to allow streaming with Suspense.
 */
export async function OrdersContent({ locale: _locale, filters }: OrdersContentProps) {
  const { page, limit, search, status, paymentStatus, from, to } = filters;
  const orderModule = createOrders();
  const normalizedStatus = ORDER_STATUS_OPTIONS.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;
  const normalizedPaymentStatus = PAYMENT_STATUS_OPTIONS.includes(paymentStatus as PaymentStatus)
    ? (paymentStatus as PaymentStatus)
    : undefined;
  const [{ orders, total }, statistics] = await Promise.all([
    orderModule.list({
      limit,
      offset: (page - 1) * limit,
      search: search || undefined,
      status: normalizedStatus,
      paymentStatus: normalizedPaymentStatus,
      from,
      to,
    }),
    orderModule.getStats(),
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
        statusCounts={statistics.ordersByStatus}
        filters={{ search, status, paymentStatus, from, to }}
      />
    </>
  );
}
