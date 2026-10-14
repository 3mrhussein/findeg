import { type ID } from '@findeg/db/types';
import { type InventoryBalanceResult } from '../inventory-ports/types';
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

/** Inventory read service factory. Each call creates a fresh service instance. */
export function createInventoryService(): InventoryService {
  return new InventoryService();
}
