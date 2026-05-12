import { type ID } from '@findeg/backend/features/core/domain/types/common';
import { type InventoryBalanceResult } from '../interfaces/IInventoryRepository';
import { inventoryQueries } from '@findeg/db/queries';

export class InventoryService {
  async getTotalAvailableStock(variantId: ID): Promise<number> {
    const balances = await inventoryQueries.getAllBalances(variantId);
    return balances.reduce((total, bal) => total + bal.available, 0);
  }

  async getWarehouseBalances(variantId: ID): Promise<InventoryBalanceResult[]> {
    return inventoryQueries.getAllBalances(variantId);
  }

  async isInStock(variantId: ID): Promise<boolean> {
    const stock = await this.getTotalAvailableStock(variantId);
    return stock > 0;
  }
}
