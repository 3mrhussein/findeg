/**
 * Application Service: VariantService
 *
 * Handles read operations for variant pricing and sell options.
 * Implementation delegates to IVariantRepository.
 */

import { type IVariantService } from "../interfaces/IVariantService";
import { type IVariantRepository, type SellOption } from "../interfaces/IVariantRepository";
import { type CustomerGroup, type UomCode } from "@/features/core/domain/types/common";
import { type CurrencyCode } from "@/features/core/domain/value-objects";

/**
 *
 */
export class VariantService implements IVariantService {
  /**
   *
   */
  constructor(private variantRepository: IVariantRepository) {}

  /**
   * Retrieves combined sell options (UoM + pricing) for a variant.
   */
  async getSellOptions(variantId: number, customerGroup?: CustomerGroup): Promise<SellOption[]> {
    return this.variantRepository.getSellOptions(variantId, customerGroup);
  }

  /**
   * Resolves a concrete unit price for a variant/UoM/customer group tuple.
   */
  async quoteUnitPrice(
    variantId: number,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<{ unitPrice: number; currency: CurrencyCode; isSellable: boolean } | null> {
    return this.variantRepository.resolveUnitPrice(variantId, uomCode, customerGroup);
  }
}
