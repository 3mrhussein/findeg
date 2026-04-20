/**
 * Variant Service Interface
 *
 * Read operations for variant-level pricing and sell options.
 */

import type { CustomerGroup, UomCode } from "@findeg/backend/features/core/domain/types/common";
import type { CurrencyCode } from "@findeg/backend/features/core/domain/value-objects";
import type { SellOption } from "./IVariantRepository";

export interface IVariantService {
  /** Gets combined sell options (UoM + optional prices) for a variant */
  getSellOptions(variantId: number, customerGroup?: CustomerGroup): Promise<SellOption[]>;

  /** Resolves a concrete unit price for a variant/UoM/customer group tuple */
  quoteUnitPrice(
    variantId: number,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<{ unitPrice: number; currency: CurrencyCode; isSellable: boolean } | null>;
}
