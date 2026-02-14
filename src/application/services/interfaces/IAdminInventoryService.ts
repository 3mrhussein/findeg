import { Product } from "@/domain/entities/Product";
import { AdminInventoryUpdate } from "@/domain/types/admin";

export interface IAdminInventoryService {
  /**
   * Get all products with stock info.
   * Can filter by low stock.
   */
  getInventory(
    lowStockOnly?: boolean,
    limit?: number,
    offset?: number,
  ): Promise<{ products: Product[]; total: number }>;

  /**
   * Update stock for a single product.
   */
  updateStock(update: AdminInventoryUpdate): Promise<void>;

  /**
   * Bulk update stock.
   */
  bulkUpdateStock(updates: AdminInventoryUpdate[]): Promise<void>;

  /**
   * Get products with low stock.
   */
  getLowStockAlerts(threshold?: number): Promise<Product[]>;
}
