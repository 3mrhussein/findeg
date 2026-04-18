import { type IVariantService } from "../interfaces/IVariantService";
import { type IVariantRepository, type SellOption } from "../interfaces/IVariantRepository";
import { type CustomerGroup, type UomCode } from "@backend/features/core/domain/types/common";
import { type CurrencyCode } from "@backend/features/core/domain/value-objects";

export class VariantService implements IVariantService {
  constructor(private variantRepository: IVariantRepository) {}

  async getSellOptions(variantId: number, customerGroup?: CustomerGroup): Promise<SellOption[]> {
    return this.variantRepository.getSellOptions(variantId, customerGroup);
  }

  async quoteUnitPrice(
    variantId: number,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<{ unitPrice: number; currency: CurrencyCode; isSellable: boolean } | null> {
    return this.variantRepository.resolveUnitPrice(variantId, uomCode, customerGroup);
  }
}
