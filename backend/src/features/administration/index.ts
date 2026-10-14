export type { AuditLogEntry } from '@findeg/catalog';
export type { DashboardStats } from './application/dtos/DashboardStats';
export type { IAdminBrandService } from '@findeg/catalog';
export type { IAdminCategoryService } from '@findeg/catalog';
export type { IAdminCollectionService } from '@findeg/catalog';
export type { IAdminDashboardService } from './application/interfaces/IAdminDashboardService';
export type { IAdminInventoryService } from './application/interfaces/IAdminInventoryService';
export type {
  ProductListFilters,
  ProductListItem,
  ProductListResult,
  ProductEditData,
  IAdminProductService,
} from '@findeg/catalog';
export type { IAdminTagService } from '@findeg/catalog';
export type {
  IAdminSchoolSupplyListService,
  SpecificationOption,
  SpecificationVariantCandidate,
  SchoolSupplyListIndexFilters,
  SchoolSupplyListIndexRow,
} from './application/interfaces/IAdminSchoolSupplyListService';
export type {
  CreateSupplyListDraftInput,
  SchoolSupplyList,
  SupplyListItemInput,
  SupplyListResult,
  UpdateSupplyListDraftInput,
} from '../school';
export type { AuditLogCreateInput, AuditLogFilters, IAuditLogRepository } from '@findeg/catalog';
export type { IAuditLogService } from '@findeg/catalog';
export type { ImportResult, ImportRowPreview, IProductImportService } from '@findeg/catalog';
export { createAdministrationServices } from './application/services/factory';
export type { AdministrationServices } from './application/services/factory';
