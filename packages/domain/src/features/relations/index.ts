/**
 * The business-domain map: which entity belongs to which area, and how entities relate. It
 * holds domain entities only, with no application plumbing (Outbox, Guest Order Access). The
 * Partner Report is not an entity, so the map leaves it out, but its rules (row grain, privacy
 * roll-up and totals) are domain rules in `partners`.
 *
 * Cross-area links are by id, never by object reference (ADR-0018). The
 * `__tests__/relations.test.ts` suite checks this map against the domain types, so a relation
 * that names a missing entity or a field the entity lacks fails the build.
 */

export * from './constants';
export * from './types';
