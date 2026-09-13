import { OrdersTable } from './OrdersTable';
import { PageHeader } from '@/app/[locale]/_components/shared/PageHeader';
import { parse } from '@findeg/backend/features/core';

interface OrdersContentProps {
  locale: string;
  filters: {
    page: number;
    limit: number;
    search: string;
    status?: any;
    paymentStatus?: any;
    startDate?: Date;
    endDate?: Date;
  };
}

/**
 * OrdersContent - Handles order data fetching and display.
 * Separated to allow streaming with Suspense.
 */
export async function OrdersContent({ locale, filters }: OrdersContentProps) {
  const { page, limit, search, status, paymentStatus, startDate, endDate } = filters;
  const offset = (page - 1) * limit;

  // TODO: Replace with data layer query from @data/orders/queries
  // const { orders, total } = await getOrders({ limit, offset, search, status, paymentStatus, startDate, endDate });
  const orders: any[] = []; // Stubbed - empty orders list
  const total = 0;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage customer orders and track fulfillment"
        count={total}
      />

      <OrdersTable
        orders={orders}
        totalCount={total}
        currentPage={page}
        pageSize={limit}
        statusFilter={status}
      />
    </>
  );
}
