import { getServices } from "@/server/getServices";
import { OrdersTable } from "./_components/OrdersTable";
import { PageHeader } from "@/app/[locale]/admin/_components/shared/PageHeader";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { OrderStatus, PaymentStatus } from "@/features/core/domain/types/common";

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
  const resolvedLocale = resolveLocale(locale);
  const query = await searchParams;

  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || "";
  const status = query.status as OrderStatus | undefined;
  const paymentStatus = query.paymentStatus as PaymentStatus | undefined;
  const startDate = query.startDate ? new Date(query.startDate) : undefined;
  const endDate = query.endDate ? new Date(query.endDate) : undefined;

  const { adminOrder } = getServices();

  const { orders, total } = await adminOrder.getAll({
    limit,
    offset,
    search: search || undefined,
    status: (status as any) !== "all" ? status : undefined,
    paymentStatus: (paymentStatus as any) !== "all" ? paymentStatus : undefined,
    startDate,
    endDate,
  });

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
