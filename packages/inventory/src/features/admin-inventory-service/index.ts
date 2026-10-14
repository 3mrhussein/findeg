import type { InventoryAuditPort } from './types';
import type { Product } from '@findeg/catalog';
import { createProductService } from '@findeg/catalog';
import type { InventoryUpdate } from '../inventory-update';
import type { IAdminInventoryService } from './types';
import { adjustStock, getLowStock, productQueries, withTransaction } from '@findeg/db/queries';
import { inventoryBalances, warehouses } from '@findeg/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Admin Inventory Service
 *
 * Manages product stock levels and inventory tracking using query primitives.
 * Provides low stock alerts and bulk update capabilities.
 * Logs all stock changes to the audit trail.
 */
export class AdminInventoryService implements IAdminInventoryService {
  private readonly productService = createProductService();

  /**
   * Creates an instance of AdminInventoryService.
   */
  constructor(private auditLogService: InventoryAuditPort) {}

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
   * Resolves the warehouse before reading the balance, inside a transaction.
   *
   * @param update - The inventory update payload (variant ID, quantity).
   * @throws Error if the variant is not found.
   */
  async updateStock(update: InventoryUpdate): Promise<void> {
    const variant = (await productQueries.getVariantsByIds([update.variantId as number]))[0];
    if (!variant) throw new Error(`Variant #${update.variantId} not found`);

    let oldQty = 0;
    await withTransaction(undefined, async (tx) => {
      // 1. Resolve warehouse before reading balance
      let warehouseId = update.warehouseId ? Number(update.warehouseId) : undefined;
      if (!warehouseId) {
        const [activeWarehouse] = await tx
          .select({ id: warehouses.id })
          .from(warehouses)
          .where(eq(warehouses.isActive, true))
          .orderBy(warehouses.id)
          .limit(1);
        if (!activeWarehouse) {
          throw new Error('No active warehouse found');
        }
        warehouseId = activeWarehouse.id;
      } else {
        const [existing] = await tx
          .select({ id: warehouses.id })
          .from(warehouses)
          .where(eq(warehouses.id, warehouseId))
          .limit(1);
        if (!existing) {
          throw new Error(`Warehouse #${warehouseId} not found`);
        }
      }

      // 2. Read balance inside transaction with resolved warehouse
      // Initialize safely so even two first-time absolute updates lock the same row.
      await tx
        .insert(inventoryBalances)
        .values({
          variantId: update.variantId as number,
          warehouseId,
          onHand: 0,
          reserved: 0,
        })
        .onConflictDoNothing();
      const [balance] = await tx
        .select({ onHand: inventoryBalances.onHand })
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.variantId, update.variantId as number),
            eq(inventoryBalances.warehouseId, warehouseId),
          ),
        )
        .for('update');
      const currentQty = balance.onHand;
      oldQty = currentQty;
      const diff = update.quantity - currentQty;

      // 3. Adjust stock inside the same transaction
      if (diff !== 0) {
        await adjustStock(
          update.variantId as number,
          warehouseId,
          {
            movementType: 'adjustment',
            quantity: diff,
            notes: update.notes || 'Admin manual update',
          },
          tx,
        );
      }
    });

    await this.auditLogService.logAction({
      entityType: 'variant',
      entityId: String(update.variantId),
      action: 'update_inventory',
      oldValues: {
        onHand: oldQty,
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

/** Admin inventory service factory. Audit entries use the catalog audit log unless one is injected. */
export function createAdminInventoryService(
  auditLogService: InventoryAuditPort,
): IAdminInventoryService {
  return new AdminInventoryService(auditLogService);
}
