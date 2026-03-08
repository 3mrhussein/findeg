import { getServices } from "@/server/getServices";
import { OrderTable } from "./OrderTable";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { Badge } from "@/components/ui/badge";
import { OrderStatus, PaymentStatus } from "@/features/core/domain/types/common";

/**
 * Admin Orders List Page
 *
 * Displays a filtered, paginated list of all orders.
 * Includes status quick-filters, date range, and bulk actions.
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

  const [{ orders, total }, statusCounts] = await Promise.all([
    adminOrder.getAll({
      limit,
      offset,
      search: search || undefined,
      status: (status as any) !== "all" ? status : undefined,
      paymentStatus: (paymentStatus as any) !== "all" ? paymentStatus : undefined,
      startDate,
      endDate,
    }),
    adminOrder.getStatusCounts(),
  ]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">📋 Orders</h2>
          <Badge variant="secondary" className="text-base px-2 py-0.5">
            {total}
          </Badge>
        </div>
        {/* Export CSV Button could go here */}
      </div>

      <OrderTable
        data={orders}
        page={page}
        limit={limit}
        total={total}
        statusCounts={statusCounts}
        filters={{
          search,
          status: query.status || "all",
          paymentStatus: query.paymentStatus || "all",
          startDate,
          endDate,
        }}
      />
    </div>
  );
}
