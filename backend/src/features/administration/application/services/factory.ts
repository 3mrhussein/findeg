/**
 * Administration Services Factory (Pure TypeScript - Framework Agnostic)
 *
 * Exports factory function that returns admin service instances.
 * Apps call this factory to get services, then wrap service calls in "use server" actions.
 *
 * Architecture: Backend exports pure TS factories → Apps create data layer with actions
 */

// Admin services
import { AdminProductService } from './AdminProductService';
import { AdminCategoryService } from './AdminCategoryService';
import { AdminBrandService } from './AdminBrandService';
import { AdminTagService } from './AdminTagService';
import { AdminCollectionService } from './AdminCollectionService';
import { AdminInventoryService } from './AdminInventoryService';
import { AdminOrderService } from './AdminOrderService';
import { AdminDashboardService } from './AdminDashboardService';
import { AuditLogService } from './AuditLogService';
import { ProductImportService } from './ProductImportService';

import { IEmailService } from '@findeg/backend/features/notifications';

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
 * export async function createProduct(input: CreateProductWithVariantsInput) {
 *   const { products } = createAdministrationServices();
 *   const result = await products.createProduct(input);
 *
 *   updateTag('products');
 *   return { success: true, data: result };
 * }
 * ```
 */
export function createAdministrationServices() {
  // Create audit log service (used by many admin services)
  const auditLogService = new AuditLogService();

  // Create admin product service (uses query primitives - no repositories needed)
  const adminProductService = new AdminProductService(auditLogService);

  // Create admin services (inject repository dependencies)
  // Note: Some services have optional dependencies (emailService)
  // For emailService, we pass a no-op implementation to avoid breaking the build
  return {
    products: adminProductService,
    categories: new AdminCategoryService(auditLogService),
    brands: new AdminBrandService(auditLogService),
    tags: new AdminTagService(auditLogService),
    collections: new AdminCollectionService(auditLogService),
    inventory: new AdminInventoryService(auditLogService),
    orders: new AdminOrderService(
      auditLogService,
      {
        // No-op email service - apps can override with real implementation
        sendOrderConfirmation: async () => { },
        sendOrderStatusUpdate: async () => { },
        sendPasswordReset: async () => { },
        sendSchoolListAccessApproved: async () => { },
        sendSchoolListAccessRequest: async () => { },
        sendAdminInvitation: async () => { },
      } as IEmailService,
    ),
    dashboard: new AdminDashboardService(),
    auditLog: auditLogService,
    productImport: new ProductImportService(adminProductService),
  };
}

/**
 * Type helper for administration services
 */
export type AdministrationServices = ReturnType<typeof createAdministrationServices>;
