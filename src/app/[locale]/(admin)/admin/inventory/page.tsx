import { container } from "@/features/core/infrastructure/di/ServiceContainer";
import { InventoryTable } from "./_components/InventoryTable";

/**
 *
 */
export default async function InventoryPage() {
  const { products } = await container.adminInventoryService.getInventory(false, 100, 0);
  const lowStock = await container.adminInventoryService.getLowStockAlerts();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <h3 className="text-lg font-medium text-red-800">Low Stock Alerts</h3>
          <p className="text-sm text-red-600 mt-1">
            The following items are below their stock threshold.
          </p>
        </div>
      )}

      <InventoryTable products={products} />
    </div>
  );
}
