import { checkCompareAtPrice, sku as domainSku } from '@findeg/domain';
import { DomainError, moneyFromDecimal } from '@findeg/domain';
import { ValidationError } from '@findeg/domain-errors';
import { getCategoryById, getBrandById, getProductById } from '@findeg/db/queries';
import type { ID } from '@findeg/db/types';

export async function ensureCategoryExists(categoryId?: number | null): Promise<void> {
  if (!categoryId) return;

  const category = await getCategoryById(categoryId);
  if (!category) throw new Error(`Category ${String(categoryId)} not found`);
}

export async function ensureBrandExists(brandId?: number | null): Promise<void> {
  if (!brandId) return;

  const brand = await getBrandById(brandId);
  if (!brand) throw new Error(`Brand ${String(brandId)} not found`);
}

/**
 * Verifies that a product exists in the database
 * @param id - Product ID
 * @returns Product row if exists
 * @throws Error if product not found
 */
export async function getExistingProductOrThrow(id: ID) {
  const existing = await getProductById(id);
  if (!existing) throw new Error(`Product ${String(id)} not found`);

  return existing;
}

/** The price and SKU fields a catalogue write carries. Absent fields are not checked. */
export interface CatalogueWriteRow {
  sku?: string;
  basePrice?: number;
  strikePrice?: number | null;
}

/**
 * Checks a catalogue write against the domain's rules: SKUs are non-empty with no padding, and
 * a compare-at price is strictly above its price. This is the one place the admin product
 * feature maps a domain error to the application's ValidationError.
 */
export function assertCatalogueWriteRules(rows: readonly CatalogueWriteRow[]): void {
  try {
    for (const row of rows) {
      if (row.sku !== undefined) domainSku(row.sku);
      if (row.basePrice === undefined) continue;
      checkCompareAtPrice(
        moneyFromDecimal(row.basePrice.toFixed(2)),
        row.strikePrice != null ? moneyFromDecimal(row.strikePrice.toFixed(2)) : null,
      );
    }
  } catch (error) {
    rethrowCatalogueWriteError(error);
  }
}

/** Map a catalogue rule rejection from either preflight validation or the locked writer. */
export function rethrowCatalogueWriteError(error: unknown): never {
  if (error instanceof DomainError) throw new ValidationError('variants', error.message);
  throw error;
}
