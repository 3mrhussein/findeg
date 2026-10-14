import 'server-only';
/** Dashboard composition wires infrastructure adapters into context services. */
import type {
  IAdminBrandService,
  IAdminCategoryService,
  IAdminCollectionService,
  IAdminProductService,
  IAdminTagService,
  IAuditLogService,
  IProductImportService,
} from '@findeg/catalog';
import type { IAdminInventoryService } from '@findeg/inventory/types';
import type { IAdminDashboardService } from './dashboard-service';
import type { IAdminSchoolSupplyListService } from '@findeg/school-lists/types';

// Catalog-owned admin services
import {
  AdminBrandService,
  AdminCategoryService,
  AdminCollectionService,
  AdminProductService,
  AdminTagService,
  ProductImportService,
} from '@findeg/catalog';

import { createAuditLogService } from '@findeg/backend/features/audit';

// Dashboard composition
import { AdminDashboardService } from './dashboard-service';
import { createAdminSchoolSupplyListService } from '@findeg/school-lists';
import { createAdminInventoryService } from '@findeg/inventory';

/**
 * Create administration services with all dependencies wired
 *
 * @returns Object containing all admin service instances
 *
 * @example
 * ```ts
 * // In app data layer (dashboard/src/data/products/actions.ts):
 * "use server";
 * import { createAdministrationServices } from '@/lib/administration';
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
export function createAdministrationServices(): AdministrationServices {
  // Create audit log service (used by many admin services)
  const auditLogService = createAuditLogService();

  // Create admin product service (uses query primitives - no repositories needed)
  const adminProductService = new AdminProductService(auditLogService);
  const adminSchoolSupplyListService = createAdminSchoolSupplyListService();

  // Create admin services (inject repository dependencies)
  return {
    products: adminProductService,
    categories: new AdminCategoryService(auditLogService),
    brands: new AdminBrandService(auditLogService),
    tags: new AdminTagService(auditLogService),
    collections: new AdminCollectionService(auditLogService),
    inventory: createAdminInventoryService(auditLogService),
    dashboard: new AdminDashboardService(),
    auditLog: auditLogService,
    productImport: new ProductImportService(adminProductService),
    schoolSupplyLists: adminSchoolSupplyListService,
  };
}

/**
 * Type helper for administration services
 */
export interface AdministrationServices {
  products: IAdminProductService;
  categories: IAdminCategoryService;
  brands: IAdminBrandService;
  tags: IAdminTagService;
  collections: IAdminCollectionService;
  inventory: IAdminInventoryService;
  dashboard: IAdminDashboardService;
  auditLog: IAuditLogService;
  productImport: IProductImportService;
  schoolSupplyLists: IAdminSchoolSupplyListService;
}
