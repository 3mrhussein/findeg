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
export * as schoolListQueries from './catalog/school-lists';
export * as tagQueries from './catalog/tags';
export * as adminSearchAnalyticsQueries from './catalog/admin-search-analytics';
export * as orderQueries from './sales/orders';
export * as reviewQueries from './review/reviews';
export * as auditLogQueries from './administration/audit-logs';
export * as notificationQueries from './notifications/notifications';
export * as userQueries from './identity/users';
export * as accessQueries from './school/access';
export * as sessionQueries from './school/sessions';

// Feature-specific queries (admin operations, school directory, etc.)
export * from './products';
export * from './identity';
export * from './school';
