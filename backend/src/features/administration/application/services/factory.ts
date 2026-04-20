/**
 * Administration Services Factory (Pure TypeScript - Framework Agnostic)
 * 
 * Exports factory function that returns admin service instances.
 * Apps call this factory to get services, then wrap service calls in "use server" actions.
 * 
 * Architecture: Backend exports pure TS factories → Apps create data layer with actions
 */

// Repositories from catalog feature (reused by admin services)
import { DrizzleProductRepository } from "../../../catalog/infrastructure/persistence/DrizzleProductRepository";
import { DrizzleCategoryRepository } from "../../../catalog/infrastructure/persistence/DrizzleCategoryRepository";
import { DrizzleBrandRepository } from "../../../catalog/infrastructure/persistence/DrizzleBrandRepository";
import { DrizzleTagRepository } from "../../../catalog/infrastructure/persistence/DrizzleTagRepository";
import { DrizzleCollectionRepository } from "../../../catalog/infrastructure/persistence/DrizzleCollectionRepository";
import { DrizzleInventoryRepository } from "../../../catalog/infrastructure/persistence/DrizzleInventoryRepository";
import { DrizzleVariantRepository } from "../../../catalog/infrastructure/persistence/DrizzleVariantRepository";

// Repository from order feature
import { DrizzleOrderRepository } from "../../../order/infrastructure/persistence/DrizzleOrderRepository";

// Administration-specific repository
import { DrizzleAuditLogRepository } from "../../infrastructure/DrizzleAuditLogRepository";

// Admin services
import { AdminProductService } from "./AdminProductService";
import { AdminCategoryService } from "./AdminCategoryService";
import { AdminBrandService } from "./AdminBrandService";
import { AdminTagService } from "./AdminTagService";
import { AdminCollectionService } from "./AdminCollectionService";
import { AdminInventoryService } from "./AdminInventoryService";
import { AdminOrderService } from "./AdminOrderService";
import { AdminDashboardService } from "./AdminDashboardService";
import { AuditLogService } from "./AuditLogService";
import { ProductImportService } from "./ProductImportService";

/**
 * Create administration services with all dependencies wired
 * 
 * @returns Object containing all admin service instances
 * 
 * @example
 * ```ts
 * // In app data layer (dashboard/src/data/products/actions.ts):
 * "use server";
 * import { createAdministrationServices } from '@findeg/backend/features/administration';
 * 
 * export async function createProduct(input: ProductInput) {
 *   const { products } = createAdministrationServices();
 *   const result = await products.create(input);
 *   
 *   updateTag('products');
 *   return { success: true, data: result };
 * }
 * ```
 */
export function createAdministrationServices() {
  // Create repositories (no arguments - they use singleton db connection)
  const productRepository = new DrizzleProductRepository();
  const categoryRepository = new DrizzleCategoryRepository();
  const brandRepository = new DrizzleBrandRepository();
  const tagRepository = new DrizzleTagRepository();
  const collectionRepository = new DrizzleCollectionRepository();
  const inventoryRepository = new DrizzleInventoryRepository();
  const variantRepository = new DrizzleVariantRepository();
  const orderRepository = new DrizzleOrderRepository();
  const auditLogRepository = new DrizzleAuditLogRepository();
  
  // Create audit log service (used by many admin services)
  const auditLogService = new AuditLogService(auditLogRepository);
  
  // Create admin product service first (needed by import service)
  const adminProductService = new AdminProductService(
    productRepository,
    categoryRepository,
    brandRepository,
    auditLogService,
    undefined // mediaService - optional
  );
  
  // Create admin services (inject repository dependencies)
  // Note: Some services have optional dependencies (mediaService, emailService)
  // For emailService, we pass a no-op implementation to avoid breaking the build
  return {
    products: adminProductService,
    categories: new AdminCategoryService(
      categoryRepository,
      auditLogService
    ),
    brands: new AdminBrandService(
      brandRepository,
      auditLogService
    ),
    tags: new AdminTagService(
      tagRepository,
      auditLogService
    ),
    collections: new AdminCollectionService(
      collectionRepository,
      auditLogService
    ),
    inventory: new AdminInventoryService(
      productRepository,
      inventoryRepository,
      variantRepository,
      auditLogService
    ),
    orders: new AdminOrderService(
      orderRepository,
      auditLogService,
      {
        // No-op email service - apps can override with real implementation
        sendOrderConfirmation: async () => {},
        sendOrderStatusUpdate: async () => {},
        sendPasswordReset: async () => {},
      } as any
    ),
    dashboard: new AdminDashboardService(
      productRepository,
      categoryRepository,
      orderRepository
    ),
    auditLog: auditLogService,
    productImport: new ProductImportService(
      adminProductService,
      productRepository
    ),
  };
}

/**
 * Type helper for administration services
 */
export type AdministrationServices = ReturnType<typeof createAdministrationServices>;
