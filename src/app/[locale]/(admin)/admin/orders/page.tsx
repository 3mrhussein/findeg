import Link from "next/link";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminOrdersPageData,
  type AdminOrdersPageQueryParams,
} from "@/features/administration/application/queries/admin-orders-page";

interface OrdersPageProps {
  searchParams: Promise<AdminOrdersPageQueryParams>;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All payments" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

function buildPageHref(page: number, query: URLSearchParams): string {
  const next = new URLSearchParams(query);
  next.set("page", String(page));
  return `?${next.toString()}`;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const data = await getAdminOrdersPageData(params);

  const currentQuery = new URLSearchParams();
  if (data.search) currentQuery.set("search", data.search);
  if (data.status) currentQuery.set("status", data.status);
  if (data.paymentStatus) currentQuery.set("paymentStatus", data.paymentStatus);
  currentQuery.set("limit", String(data.limit));

  const from = data.total === 0 ? 0 : (data.page - 1) * data.limit + 1;
  const to = Math.min(data.page * data.limit, data.total);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>

      <form className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="orders-search">Search</Label>
          <Input
            id="orders-search"
            name="search"
            placeholder="Order id, email, tracking..."
            defaultValue={data.search}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="orders-status">Status</Label>
          <select
            id="orders-status"
            name="status"
            defaultValue={data.status || ""}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="orders-payment-status">Payment</Label>
          <select
            id="orders-payment-status"
            name="paymentStatus"
            defaultValue={data.paymentStatus || ""}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="limit" value={String(data.limit)} />
          <Button type="submit" className="flex-1">
            Apply
          </Button>
          <Button asChild type="button" variant="outline" className="flex-1">
            <Link href="?page=1">Reset</Link>
          </Button>
        </div>
      </form>

      <OrdersTable orders={data.orders} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {from}-{to} of {data.total}
        </p>

        <div className="flex gap-2">
          {data.page <= 1 ? (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href={buildPageHref(data.page - 1, currentQuery)}>Previous</Link>
            </Button>
          )}

          {data.page >= data.totalPages ? (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href={buildPageHref(data.page + 1, currentQuery)}>Next</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
