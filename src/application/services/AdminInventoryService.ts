import { IAdminInventoryService } from "@/application/services/interfaces/IAdminInventoryService";
import { IProductRepository } from "@/application/repositories/IProductRepository";
import { IAuditLogService } from "@/application/services/interfaces/IAuditLogService";
import { Product } from "@/domain/entities/Product";
import { AdminInventoryUpdate } from "@/domain/types/admin";

/**
 * Admin Inventory Service
 *
 * Manages product stock levels and inventory tracking.
 * Provides low stock alerts and bulk update capabilities.
 * Logs all stock changes to the audit trail.
 */
export class AdminInventoryService implements IAdminInventoryService {
  /**
   * Creates an instance of AdminInventoryService
   *
   * @param productRepository - Product data access layer
   * @param auditLogService - Audit logging service for tracking stock changes
   */
  constructor(
    private productRepository: IProductRepository,
    private auditLogService: IAuditLogService,
  ) {}

  /**
   * Retrieves inventory with optional filtering
   *
   * @param lowStockOnly - If true, returns only products below threshold
   * @param limit - Maximum number of products to return
   * @param offset - Pagination offset
   * @returns Paginated inventory list with total count
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
   * Updates stock quantity for a single product
   *
   * Logs the stock change to the audit trail.
   *
   * @param update - Inventory update with product ID and new quantity
   * @throws Error if product not found
   */
  async updateStock(update: AdminInventoryUpdate): Promise<void> {
    const product = await this.productRepository.getById(update.productId);
    if (!product) throw new Error(`Product #${update.productId} not found`);

    await this.productRepository.updateStockConfiguration(update.productId, {
      quantity: update.quantity,
      lowStockThreshold: update.lowStockThreshold,
    });

    const auditData: any = {
      stock: { old: product.stockQuantity, new: update.quantity },
    };

    if (
      update.lowStockThreshold !== undefined &&
      update.lowStockThreshold !== product.lowStockThreshold
    ) {
      auditData.lowStockThreshold = {
        old: product.lowStockThreshold,
        new: update.lowStockThreshold,
      };
    }

    await this.auditLogService.logAction({
      entityType: "product",
      entityId: String(update.productId),
      action: "update_inventory",
      adminUserId: null,
      oldValues: auditData.oldValues || {
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
   * Updates stock quantities for multiple products in batch
   *
   * Processes each update sequentially with audit logging.
   *
   * @param updates - Array of inventory updates
   */
  async bulkUpdateStock(updates: AdminInventoryUpdate[]): Promise<void> {
    for (const update of updates) {
      await this.updateStock(update); // Simply loop for now
    }
    // Repo bulkUpdateStock expects simple ID/qty pairs, service takes full update obj with possible threshold.
    // If threshold not supported in bulk yet, loop is safe fallback.
    // Or call repo.bulkUpdateStock if checks pass.
  }

  /**
   * Retrieves products with low stock levels
   *
   * @param threshold - Optional custom threshold (uses product's lowStockThreshold if not provided)
   * @returns Array of products below stock threshold
   */
  async getLowStockAlerts(threshold?: number): Promise<Product[]> {
    return this.productRepository.getLowStock(threshold);
  }
}
