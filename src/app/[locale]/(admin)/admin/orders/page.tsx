import { container } from "@/infrastructure/di/ServiceContainer";
import { OrdersTable } from "@/components/admin/orders/orders-table";

/**
 *
 */
export default async function OrdersPage() {
  const { orders } = await container.adminOrderService.getAll({});

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
