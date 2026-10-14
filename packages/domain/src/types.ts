/**
 * The root type entry: every type the root index exports, with no runtime value. Consumers that
 * need only types import `@findeg/domain/types`; the type-only re-export keeps the entry erased.
 */
export type * from './index';
