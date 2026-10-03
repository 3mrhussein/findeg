// Organized query module exports by data domain

// Data domain primitives (reusable across features)
export * from './catalog';
export * from './sales';
export * from './inventory';
export type { OrderRow, OrderItemRow } from './sales/orders';
export * as productQueries from './catalog/products';
export * as categoryQueries from './catalog/categories';
export * as brandQueries from './catalog/brands';
export * as collectionQueries from './catalog/collections';
export * as inventoryQueries from './catalog/inventory';
export * as tagQueries from './catalog/tags';
export * as adminSearchAnalyticsQueries from './catalog/admin-search-analytics';
export * as orderQueries from './sales/orders';
export * as checkoutIdempotencyQueries from './sales/checkout-idempotency';
export * as reviewQueries from './review/reviews';
export * as auditLogQueries from './administration/audit-logs';
export * as notificationQueries from './notifications/notifications';
export * as userQueries from './identity/users';

// Feature-specific queries (admin operations, etc.)
export * from './products';
export * from './identity';
export { withTransaction, type DbTransaction } from './transaction';
