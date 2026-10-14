/**
 * Administration Services Factory (Pure TypeScript - Framework Agnostic)
 *
 * Exports factory function that returns admin service instances.
 * Apps call this factory to get services, then wrap service calls in "use server" actions.
 *
 * Architecture: Backend exports pure TS factories → Apps create data layer with actions
 */

import type {
  IAdminBrandService,
  IAdminCategoryService,
  IAdminCollectionService,
  IAdminProductService,
  IAdminTagService,
  IAuditLogService,
  IProductImportService,
} from '@findeg/catalog';
import type { IAdminInventoryService } from '../interfaces/IAdminInventoryService';
import type { IAdminDashboardService } from '../interfaces/IAdminDashboardService';
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

// Administration-owned services
import { AdminInventoryService } from './AdminInventoryService';
import { AdminDashboardService } from './AdminDashboardService';
import { AuditLogService } from './AuditLogService';
import { createAdminSchoolSupplyListService } from '@findeg/school-lists';

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
export function createAdministrationServices(): AdministrationServices {
  // Create audit log service (used by many admin services)
  const auditLogService = new AuditLogService();

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
    inventory: new AdminInventoryService(auditLogService),
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
