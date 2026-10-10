/**
 * @findeg/schema: the workspace's single source of truth for the Business Domain Schema.
 *
 * Domain values are declared here once. db, packages and apps import them and derive their
 * own forms (pgEnum, zod, labels) from them; they never redeclare a value set.
 */
export * from './common';
export * from './identity';
export * from './sales';
export * from './school';
export * from './system';
