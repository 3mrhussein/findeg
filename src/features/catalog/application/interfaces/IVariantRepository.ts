/**
 * Variant Repository Interface
 *
 * Defines the contract for variant (SKU) data access.
 * Extracted from IProductRepository to separate SPU from SKU concerns.
 */

import {
  type ID,
  type CustomerGroup,
  type UomCode,
  type Price,
} from "@/features/core/domain/types/common";
import type { CurrencyCode, Locale } from "@/features/core/domain/value-objects";
import type { Variant } from "../../domain/entities/Variant";
import type { VariantInput } from "@/features/administration/domain/types/ProductInput";

// ─── Sell Option ─────────────────────────────────────────────────────────────

export interface SellOption {
  uomCode: UomCode;
  factorToBase: number;
  isEnabled: boolean;
  unitPrice?: Price;
  currency?: CurrencyCode;
  isSellable?: boolean;
}

export interface PriceResult {
  unitPrice: Price;
  currency: CurrencyCode;
  isSellable: boolean;
}

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

  /** Gets combined sell options (UoM + optional prices) for a variant */
  getSellOptions(variantId: ID, customerGroup?: CustomerGroup): Promise<SellOption[]>;

  /** Resolves effective unit price for a variant/UoM/customer group */
  resolveUnitPrice(
    variantId: ID,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<PriceResult | null>;

  /** Upserts sellable UoM definitions for a variant */
  upsertSellableUoms(
    variantId: ID,
    uoms: { uomCode: UomCode; factorToBase: number; isEnabled?: boolean }[],
  ): Promise<void>;

  /** Upserts customer-group price lists for a variant */
  upsertPriceLists(
    variantId: ID,
    prices: {
      customerGroup: CustomerGroup;
      uomCode: UomCode;
      unitPrice: Price;
      currency?: CurrencyCode;
      isSellable?: boolean;
    }[],
  ): Promise<void>;
}
