import { type ID } from "@features/core/domain/types/common";
import {
  type IInventoryRepository,
  type InventoryBalanceResult,
} from "../interfaces/IInventoryRepository";

export class InventoryService {
  constructor(private inventoryRepository: IInventoryRepository) {}

  async getTotalAvailableStock(variantId: ID): Promise<number> {
    const balances = await this.inventoryRepository.getAllBalances(variantId);
    return balances.reduce((total, bal) => total + bal.available, 0);
  }

  async getWarehouseBalances(variantId: ID): Promise<InventoryBalanceResult[]> {
    return this.inventoryRepository.getAllBalances(variantId);
  }

  async isInStock(variantId: ID): Promise<boolean> {
    const stock = await this.getTotalAvailableStock(variantId);
    return stock > 0;
  }
}
