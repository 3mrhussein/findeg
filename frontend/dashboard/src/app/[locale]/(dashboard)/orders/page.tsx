import { OrdersTable } from './_components/OrdersTable';
import { PageHeader } from '@/app/[locale]/_components/shared/PageHeader';
import { parse } from '@findeg/backend/features/core';

/**
 * Local type definitions
 */
type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Admin Orders List Page
 *
 * Displays a filtered, paginated list of all orders.
 * Includes status tabs, enriched row pattern, and bulk actions.
 */
export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const { locale } = await params;
  const resolvedLocale = parse(locale);
  const query = await searchParams;

  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || '';
  const status = query.status as OrderStatus | undefined;
  const paymentStatus = query.paymentStatus as PaymentStatus | undefined;
  const startDate = query.startDate ? new Date(query.startDate) : undefined;
  const endDate = query.endDate ? new Date(query.endDate) : undefined;

  // TODO: Replace with data layer query from @data/orders/queries
  // const { orders, total } = await getOrders({ limit, offset, search, status, paymentStatus, startDate, endDate });
  const orders: any[] = []; // Stubbed - empty orders list
  const total = 0;

  return (
    <div className="flex-1 space-y-6">
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
        statusFilter={query.status}
      />
    </div>
  );
}
