import { IAdminInventoryService } from '../interfaces/IAdminInventoryService';
import { IAuditLogService } from '../interfaces/IAuditLogService';
import { Product } from '../../../catalog/domain/entities/Product';
import { InventoryUpdate } from '@findeg/backend/features/catalog/application/dtos/InventoryUpdate';
import { getBalance, adjustStock, getLowStock, productQueries } from '@findeg/db/queries';
import { createCatalogServices } from '../../../catalog';

/**
 * Admin Inventory Service
 *
 * Manages product stock levels and inventory tracking using query primitives.
 * Provides low stock alerts and bulk update capabilities.
 * Logs all stock changes to the audit trail.
 */
export class AdminInventoryService implements IAdminInventoryService {
  private readonly productService = createCatalogServices().products;

  /**
   * Creates an instance of AdminInventoryService.
   */
  constructor(
    private auditLogService: IAuditLogService,
  ) { }

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
      const lowStockResults = await getLowStock();
      const productIds = Array.from(new Set(lowStockResults.map((r) => r.variant.productId)));
      const paginatedProductIds = productIds.slice(offset, offset + limit);

      const products = await Promise.all(
        paginatedProductIds.map((id) => this.productService.getById(id)),
      );

      return {
        products: products.filter((p): p is Product => p !== null),
        total: productIds.length,
      };
    }

    return this.productService.getFilteredProducts({ limit, offset, sort: 'newest' });
  }

  /**
   * Updates the stock level for a specific variant.
   * Triggers an audit log entry with the old and new values.
   *
   * @param update - The inventory update payload (variant ID, quantity).
   * @throws Error if the variant is not found.
   */
  async updateStock(update: InventoryUpdate): Promise<void> {
    const variant = (await productQueries.getVariantsByIds([update.variantId as number]))[0];
    if (!variant) throw new Error(`Variant #${update.variantId} not found`);

    const balance = await getBalance(update.variantId as number, update.warehouseId as number);
    const currentQty = balance?.onHand || 0;
    const diff = update.quantity - currentQty;

    // Default to primary warehouse (ID 1) if not specified
    const warehouseId = update.warehouseId || 1;

    if (diff !== 0) {
      await adjustStock(update.variantId as number, Number(warehouseId), {
        movementType: 'adjustment',
        quantity: diff,
        notes: update.notes || 'Admin manual update',
      });
    }

    await this.auditLogService.logAction({
      entityType: 'variant',
      entityId: String(update.variantId),
      action: 'update_inventory',
      oldValues: {
        onHand: currentQty,
      },
      newValues: {
        onHand: update.quantity,
        notes: update.notes,
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
  async getLowStockAlerts(threshold?: number): Promise<Product[]> {
    const lowStockResults = await getLowStock(threshold);
    const productIds = Array.from(new Set(lowStockResults.map((r) => r.variant.productId)));

    const products = await Promise.all(productIds.map((id) => this.productService.getById(id)));

    return products.filter((p): p is Product => p !== null);
  }
}
