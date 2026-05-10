/**
 * Variant Repository Interface
 *
 * Defines the contract for variant (SKU) data access.
 * Extracted from IProductRepository to separate SPU from SKU concerns.
 */

import {
  type ID,
} from '@findeg/backend/features/core/domain/types/common';
import type { CurrencyCode } from '@findeg/backend/features/core/domain/value-objects';
import type { Variant } from '../../domain/entities/Variant';
import type { VariantInput } from '@findeg/backend/features/administration/domain/types/ProductInput';


// ─── Interface ───────────────────────────────────────────────────────────────

export interface IVariantRepository {
  /** Retrieves all variants for a product */
  getByProductId(productId: ID): Promise<Variant[]>;

  /** Retrieves a single variant by ID */
  getById(variantId: ID): Promise<Variant | null>;

  /** Retrieves a variant by its SKU code */
  getBySku(sku: string): Promise<Variant | null>;

  /** Creates a new variant for a product */
  create(productId: ID, input: VariantInput): Promise<Variant>;

  /** Updates an existing variant */
  update(variantId: ID, input: Partial<VariantInput>): Promise<Variant>;

  /** Deletes a variant and cascading data */
  delete(variantId: ID): Promise<void>;

}
