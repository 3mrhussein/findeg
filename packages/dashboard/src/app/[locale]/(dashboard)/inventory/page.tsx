import { getInventoryWithProducts, getLowStockAlerts } from "@data/inventory/queries";
import { InventoryTable } from "./_components/InventoryTable";

/**
 *
 */
export default async function InventoryPage() {
  const { products } = await getInventoryWithProducts({
    includeZeroStock: false,
    limit: 100,
    offset: 0,
  });
  const lowStock = await getLowStockAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
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
