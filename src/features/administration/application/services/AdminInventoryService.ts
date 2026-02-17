import { ID, Quantity } from "@/features/core/domain/types/common";
import { IAdminInventoryService } from "../interfaces/IAdminInventoryService";
import { IProductRepository } from "@/features/catalog/application/interfaces/IProductRepository";
import { IAuditLogService } from "../interfaces/IAuditLogService";
import { Product } from "@/features/catalog/domain/entities/Product";
import { InventoryUpdate } from "../../domain/types/InventoryUpdate";

/**
 * Admin Inventory Service
 *
 * Manages product stock levels and inventory tracking.
 * Provides low stock alerts and bulk update capabilities.
 * Logs all stock changes to the audit trail.
 */
export class AdminInventoryService implements IAdminInventoryService {
  /**
   * Creates an instance of AdminInventoryService.
   *
   * @param productRepository - Repository for accessing and updating product stock.
   * @param auditLogService - Service for tracking stock adjustment history.
   */
  constructor(
    private productRepository: IProductRepository,
    private auditLogService: IAuditLogService,
  ) {}

  /**
   * Retrieves a paginated list of products and their current inventory status.
   *
   * @param lowStockOnly - If true, only returns products below their threshold.
   * @param limit - Pagination limit.
   * @param offset - Pagination offset.
   * @returns Products and total count for pagination metadata.
   */
  async getInventory(
    lowStockOnly: boolean = false,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ products: Product[]; total: number }> {
    if (lowStockOnly) {
      const lowStockProducts = await this.productRepository.getLowStock();
      return {
        products: lowStockProducts.slice(offset, offset + limit),
        total: lowStockProducts.length,
      };
    }

    return this.productRepository.getFiltered({ limit, offset, sort: "newest" });
  }

  /**
   * Updates the stock level for a specific product.
   * Triggers an audit log entry with the old and new values.
   *
   * @param update - The inventory update payload (product ID, quantity, threshold).
   * @throws Error if the product is not found.
   */
  async updateStock(update: InventoryUpdate): Promise<void> {
    const product = await this.productRepository.getById(update.productId);
    if (!product) throw new Error(`Product #${update.productId} not found`);

    await this.productRepository.updateStockConfiguration(update.productId, {
      quantity: update.quantity,
      lowStockThreshold: update.lowStockThreshold,
    });

    await this.auditLogService.logAction({
      entityType: "product",
      entityId: String(update.productId),
      action: "update_inventory",
      adminUserId: undefined,
      oldValues: {
        stock: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
      },
      newValues: {
        stock: update.quantity,
        lowStockThreshold: update.lowStockThreshold ?? product.lowStockThreshold,
      },
    });
  }

  /**
   * Processes a batch of stock updates.
   *
   * @param updates - Array of inventory updates to apply sequentially.
   */
  async bulkUpdateStock(updates: InventoryUpdate[]): Promise<void> {
    for (const update of updates) {
      await this.updateStock(update);
    }
  }

  /**
   * Retrieves products that are currently at or below their low-stock threshold.
   *
   * @param threshold - Optional override for the low-stock limit.
   * @returns List of products requiring restock attention.
   */
  async getLowStockAlerts(threshold?: Quantity): Promise<Product[]> {
    return this.productRepository.getLowStock(threshold);
  }
}
