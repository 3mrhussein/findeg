import { checkCompareAtPrice, sku as domainSku } from '@findeg/domain/catalog';
import { DomainError, moneyFromDecimal } from '@findeg/domain/common';
import { ValidationError } from '../../../../core/domain/errors/ValidationError';
import { getCategoryById, getBrandById, getProductById } from '@findeg/db/queries';
import type { ID } from '../../../../core/domain/types/common';

export async function ensureCategoryExists(categoryId?: number | null): Promise<void> {
  if (!categoryId) return;

  const category = await getCategoryById(categoryId);
  if (!category) throw new Error(`Category ${categoryId} not found`);
}

export async function ensureBrandExists(brandId?: number | null): Promise<void> {
  if (!brandId) return;

  const brand = await getBrandById(brandId);
  if (!brand) throw new Error(`Brand ${brandId} not found`);
}

/**
 * Verifies that a product exists in the database
 * @param id - Product ID
 * @returns Product row if exists
 * @throws Error if product not found
 */
export async function getExistingProductOrThrow(id: ID) {
  const existing = await getProductById(id as number);
  if (!existing) throw new Error(`Product ${id} not found`);

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
    if (error instanceof DomainError) throw new ValidationError('variants', error.message);
    throw error;
  }
}
