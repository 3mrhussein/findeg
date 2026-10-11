import type { Order, OrderStats } from '@findeg/orders';
import { ORDER_STATUS_OPTIONS, type OrderStatus } from '@findeg/orders/schemas';
import { piastersToEgp } from '@findeg/money';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@findeg/ui';

interface DashboardOrdersWidgetProps {
  locale: string;
  stats: Pick<OrderStats, 'currency' | 'totalOrders' | 'totalRevenue' | 'ordersByStatus'>;
  recentOrders: Pick<Order, 'id' | 'orderReference' | 'totalAmount' | 'status'>[];
  labels: {
    revenue: string;
    orders: string;
    distribution: string;
    recent: string;
    viewAll: string;
    empty: string;
    reference: string;
    total: string;
    status: string;
    statuses: Record<OrderStatus, string>;
  };
}

/** Dashboard home Order reads retain exact accepted values, including cancelled Orders. */
export function DashboardOrdersWidget({
  locale,
  stats,
  recentOrders,
  labels,
}: DashboardOrdersWidgetProps) {
  return (
    <section className="space-y-4 px-1" aria-label={labels.recent}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{labels.revenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl font-semibold tabular-nums"
              data-testid="dashboard-orders-revenue"
            >
              {stats.currency} {piastersToEgp(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{labels.orders}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums" data-testid="dashboard-orders-count">
              {stats.totalOrders}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{labels.distribution}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {ORDER_STATUS_OPTIONS.map((status) => (
              <div key={status} data-testid={`dashboard-order-status-${status}`}>
                <dt className="text-sm text-muted-foreground">{labels.statuses[status]}</dt>
                <dd className="text-xl font-semibold tabular-nums">
                  {stats.ordersByStatus[status]}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{labels.recent}</CardTitle>
          <a
            href={`/${locale}/orders`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {labels.viewAll}
          </a>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">{labels.empty}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.reference}</TableHead>
                  <TableHead>{labels.total}</TableHead>
                  <TableHead>{labels.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <a
                        href={`/${locale}/orders/${order.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {order.orderReference}
                      </a>
                    </TableCell>
                    <TableCell>
                      {stats.currency} {piastersToEgp(order.totalAmount)}
                    </TableCell>
                    <TableCell>{labels.statuses[order.status]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
