/**
 * Administration Services Factory (Pure TypeScript - Framework Agnostic)
 *
 * Exports factory function that returns admin service instances.
 * Apps call this factory to get services, then wrap service calls in "use server" actions.
 *
 * Architecture: Backend exports pure TS factories → Apps create data layer with actions
 */

import type { IAdminProductService } from '@findeg/catalog';
import type { IAdminCategoryService } from '@findeg/catalog';
import type { IAdminBrandService } from '@findeg/catalog';
import type { IAdminTagService } from '@findeg/catalog';
import type { IAdminCollectionService } from '@findeg/catalog';
import type { IAdminInventoryService } from '../interfaces/IAdminInventoryService';
import type { IAdminDashboardService } from '../interfaces/IAdminDashboardService';
import type { IAuditLogService } from '@findeg/catalog';
import type { IProductImportService } from '@findeg/catalog';
import type { IAdminSchoolSupplyListService } from '../interfaces/IAdminSchoolSupplyListService';

// Admin services
import { AdminProductService } from '@findeg/catalog';
import { AdminCategoryService } from '@findeg/catalog';
import { AdminBrandService } from '@findeg/catalog';
import { AdminTagService } from '@findeg/catalog';
import { AdminCollectionService } from '@findeg/catalog';
import { AdminInventoryService } from './AdminInventoryService';
import { AdminDashboardService } from './AdminDashboardService';
import { AuditLogService } from './AuditLogService';
import { ProductImportService } from '@findeg/catalog';
import { AdminSchoolSupplyListService } from './AdminSchoolSupplyListService';
import { createSchoolSupplyListService } from '../../../school';
import {
  findVariantCandidates,
  listAttributeValuesForCategory,
  listSchoolSupplyLists,
  listSchoolListPartners,
} from '@findeg/db/queries/school-supply-lists';

async function loadDb() {
  return (await import('@findeg/db/connection')).db;
}

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
  const schoolSupplyListLifecycle = createSchoolSupplyListService();
  const adminSchoolSupplyListService = new AdminSchoolSupplyListService(
    schoolSupplyListLifecycle,
    async (categoryId) => listAttributeValuesForCategory(await loadDb(), categoryId),
    async (categoryId) => findVariantCandidates(await loadDb(), { categoryId }),
    async (filters) => listSchoolSupplyLists(await loadDb(), filters),
    async () => listSchoolListPartners(await loadDb()),
  );

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
