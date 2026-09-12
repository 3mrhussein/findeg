import { is, Table } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';
import * as legacySchema from '../schema/index.js';
import * as identity_access from '../modules/identity-access/schema.js';
import * as partner_management from '../modules/partner-management/schema.js';
import * as catalog from '../modules/catalog/schema.js';
import * as school_supply_lists from '../modules/school-supply-lists/schema.js';
import * as inventory from '../modules/inventory/schema.js';
import * as commerce from '../modules/commerce/schema.js';
import * as partner_rewards from '../modules/partner-rewards/schema.js';
import * as partner_reports from '../modules/partner-reports/schema.js';
import * as runtime from '../modules/runtime/schema.js';

/** All owners contribute to one schema assembly and db/migrations history. */
export const moduleSchemas = {
  'identity-access': identity_access,
  'partner-management': partner_management,
  catalog: catalog,
  'school-supply-lists': school_supply_lists,
  inventory: inventory,
  commerce: commerce,
  'partner-rewards': partner_rewards,
  'partner-reports': partner_reports,
  runtime: runtime,
} as const;

export function validateSchemaOwnership(
  tables: readonly string[],
  owners: Readonly<Record<string, readonly string[]>>,
): Readonly<Record<string, string>> {
  const ownership: Record<string, string> = {};
  const known = new Set(tables);
  for (const [owner, records] of Object.entries(owners)) {
    for (const record of records) {
      if (!known.has(record)) throw new Error(`Schema has unknown record: ${record}`);
      if (ownership[record]) throw new Error(`Schema has multiple owners: ${record}`);
      ownership[record] = owner;
    }
  }
  for (const record of tables) {
    if (!ownership[record]) throw new Error(`Schema has unowned record: ${record}`);
  }
  return Object.freeze(ownership);
}

function tableNames(exports: Record<string, unknown>): string[] {
  return Object.values(exports)
    .filter((value) => is(value, Table))
    .map((table) => {
      const config = getTableConfig(table);
      return `${config.schema ?? 'public'}.${config.name}`;
    });
}

export const schemaOwnership = validateSchemaOwnership(
  [...new Set([...tableNames(legacySchema), ...Object.values(moduleSchemas).flatMap(tableNames)])],
  Object.fromEntries(
    Object.entries(moduleSchemas).map(([owner, schema]) => [owner, tableNames(schema)]),
  ),
);

// Drizzle Kit consumes this one assembled export. Relations/enums retain legacy compatibility.
export * from '../schema/index.js';

export * from '../modules/identity-access/schema.js';
export * from '../modules/partner-management/schema.js';
export * from '../modules/catalog/schema.js';
export * from '../modules/school-supply-lists/schema.js';
export * from '../modules/inventory/schema.js';
export * from '../modules/commerce/schema.js';
export * from '../modules/partner-rewards/schema.js';
export * from '../modules/partner-reports/schema.js';
export * from '../modules/runtime/schema.js';
