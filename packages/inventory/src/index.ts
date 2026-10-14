/**
 * Inventory bounded context (`@findeg/inventory`).
 *
 * Owns variant stock levels, low-stock reads and admin stock updates. Values come from
 * `@findeg/domain`; persistence goes through `@findeg/db` query modules only.
 */
export { createInventoryService } from './features/inventory-read/index';
export { createAdminInventoryService } from './features/admin-inventory-service/index';
export * from './features/inventory-update/index';
export type * from './features/inventory-ports/types';
export type * from './features/admin-inventory-service/types';
