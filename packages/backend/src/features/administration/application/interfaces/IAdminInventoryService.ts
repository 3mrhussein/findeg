import { Product } from "@features/catalog/domain/entities/Product";
import { InventoryUpdate } from "@features/administration/domain/types";

export interface IAdminInventoryService {
  /**
   * Retrieves a paginated list of products with their current stock levels.
   *
   * @param lowStockOnly - If true, only returns products below their low-stock threshold.
   * @param limit - Maximum number of items to return.
   * @param offset - Pagination offset.
   * @returns A list of products and the total count.
   */
  getInventory(
    lowStockOnly?: boolean,
    limit?: number,
    offset?: number,
  ): Promise<{ products: Product[]; total: number }>;

  /**
   * Updates the stock quantity for a single product.
   *
   * @param update - Object containing product ID and new quantity.
   */
  updateStock(update: InventoryUpdate): Promise<void>;

  /**
   * Performs a bulk update of stock quantities for multiple products.
   *
   * @param updates - Array of inventory update objects.
   */
  bulkUpdateStock(updates: InventoryUpdate[]): Promise<void>;

  /**
   * Retrieves active alerts for products currently below their low-stock threshold.
   *
   * @param threshold - Optional override for the low-stock threshold.
   */
  getLowStockAlerts(threshold?: number): Promise<Product[]>;
}
