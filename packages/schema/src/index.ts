/**
 * @findeg/schema: the workspace's single source of truth for the Business Domain Schema.
 *
 * One folder per domain. Consumers import from the root or from a domain subpath, and never
 * redeclare a value set. `relations` holds the business-domain map that tests validate.
 */
export * from './common';
export * from './customers';
export * from './catalog';
export * from './partners';
export * from './school-lists';
export * from './orders';
export * from './inventory';
export * from './outbox';
export * from './relations';
