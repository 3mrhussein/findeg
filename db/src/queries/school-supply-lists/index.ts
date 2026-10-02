import { and, asc, eq, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../schema';

/**
 * School Supply List catalog queries: the candidate variants that feed
 * `eligibleVariants`, and the attribute values behind the authoring picker.
 *
 * Like the partner queries these never import `connection.ts`: callers pass the
 * executor (a database or an open transaction).
 */

export type SchoolSupplyListDatabase = PostgresJsDatabase<typeof schema>;
export type SchoolSupplyListTransaction = Parameters<
  Parameters<SchoolSupplyListDatabase['transaction']>[0]
>[0];
export type SchoolSupplyListExecutor = SchoolSupplyListDatabase | SchoolSupplyListTransaction;

const { attributes, productVariants, products, variantAttributes } = schema;

export interface VariantCandidateRow {
  variantId: number;
  categoryId: number | null;
  /** Attribute key → string value (only attributes with a value). */
  attributes: Record<string, string>;
}

export interface VariantCandidateFilter {
  /** Only variants of products in exactly this category. */
  categoryId?: number;
  /** Only these variants. */
  variantIds?: number[];
}

/**
 * Active variants of active products with their category and attribute values.
 * There is deliberately no row limit.
 */
export async function findVariantCandidates(
  executor: SchoolSupplyListExecutor,
  filter: VariantCandidateFilter = {},
): Promise<VariantCandidateRow[]> {
  if (filter.variantIds?.length === 0) return [];

  const rows = await executor
    .select({
      variantId: productVariants.id,
      categoryId: products.categoryId,
      attributeKey: attributes.key,
      value: variantAttributes.valueText,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(variantAttributes, eq(variantAttributes.variantId, productVariants.id))
    .leftJoin(attributes, eq(attributes.id, variantAttributes.attributeId))
    .where(
      and(
        eq(productVariants.isActive, true),
        eq(products.isActive, true),
        filter.categoryId === undefined ? undefined : eq(products.categoryId, filter.categoryId),
        filter.variantIds ? inArray(productVariants.id, filter.variantIds) : undefined,
      ),
    )
    .orderBy(asc(productVariants.id));

  // Entries are collected in Maps and turned into records with Object.fromEntries,
  // which defines own properties, so a key such as `__proto__` is kept as data.
  const byVariant = new Map<number, { categoryId: number | null; entries: [string, string][] }>();
  for (const row of rows) {
    let candidate = byVariant.get(row.variantId);
    if (!candidate) {
      candidate = { categoryId: row.categoryId, entries: [] };
      byVariant.set(row.variantId, candidate);
    }
    if (row.attributeKey !== null && row.value !== null) {
      candidate.entries.push([row.attributeKey, row.value]);
    }
  }
  return [...byVariant.entries()].map(([variantId, { categoryId, entries }]) => ({
    variantId,
    categoryId,
    attributes: Object.fromEntries(entries),
  }));
}

export interface AttributeValues {
  attributeKey: string;
  values: string[];
}

/**
 * The distinct values to offer per attribute for a category. An attribute's
 * enumerated values win whenever they are set (even an empty list, which offers nothing); otherwise the values in use by active
 * variants of active products in that category. Attributes with no values are
 * left out. Sorted by attribute key, values sorted.
 */
export async function listAttributeValuesForCategory(
  executor: SchoolSupplyListExecutor,
  categoryId: number,
): Promise<AttributeValues[]> {
  const inUse = await executor
    .selectDistinct({
      attributeKey: attributes.key,
      enumValues: attributes.enumValues,
      value: variantAttributes.valueText,
    })
    .from(variantAttributes)
    .innerJoin(attributes, eq(attributes.id, variantAttributes.attributeId))
    .innerJoin(productVariants, eq(productVariants.id, variantAttributes.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true),
        eq(productVariants.isActive, true),
        eq(attributes.isActive, true),
      ),
    );

  const byKey = new Map<string, { enumValues: string[] | null; used: Set<string> }>();
  for (const row of inUse) {
    let entry = byKey.get(row.attributeKey);
    if (!entry) {
      entry = { enumValues: toStringArray(row.enumValues), used: new Set() };
      byKey.set(row.attributeKey, entry);
    }
    if (row.value !== null) entry.used.add(row.value);
  }

  return [...byKey.entries()]
    .map(([attributeKey, { enumValues, used }]) => ({
      attributeKey,
      values: [...new Set(enumValues ?? used)].sort(),
    }))
    .filter((entry) => entry.values.length > 0)
    .sort((a, b) => a.attributeKey.localeCompare(b.attributeKey));
}

/** An explicitly configured enum (even an empty one) is kept; unset (null/non-array) is `null`. */
function toStringArray(value: unknown): string[] | null {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : null;
}
