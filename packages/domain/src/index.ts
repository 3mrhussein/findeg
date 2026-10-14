/**
 * @findeg/domain: FindEg's business domain, pure and dependent only on zod.
 *
 * One bounded-context module per directory under features/. Consumers use the root runtime
 * or types entry and never redeclare a value set. `relations` holds the business-domain map that tests validate.
 */
export * from './features/common';
export * from './features/customers';
export * from './features/catalog';
export * from './features/partners';
export * from './features/school-lists';
export * from './features/orders';
export * from './features/inventory';
export * from './features/relations';
