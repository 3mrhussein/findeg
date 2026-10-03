import { PageHeader } from '@/app/[locale]/_components/shared/PageHeader';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@findeg/backend/features/order';
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
  const administration = createAdministrationServices();
  const normalizedStatus = ORDER_STATUS_OPTIONS.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;
  const normalizedPaymentStatus = PAYMENT_STATUS_OPTIONS.includes(paymentStatus as PaymentStatus)
    ? (paymentStatus as PaymentStatus)
    : undefined;
  const [{ orders, total }, statusCounts] = await Promise.all([
    administration.orders.getAll({
      limit,
      offset: (page - 1) * limit,
      search: search || undefined,
      status: normalizedStatus,
      paymentStatus: normalizedPaymentStatus,
      startDate,
      endDate,
    }),
    administration.orders.getStatusCounts(),
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
        statusCounts={statusCounts}
        filters={{ search, status, paymentStatus, startDate, endDate }}
      />
    </>
  );
}
