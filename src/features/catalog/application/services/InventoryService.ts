/**
 * Application Service: InventoryService
 *
 * Handles variant-level inventory queries and management logic.
 */

import { type ID } from "@/features/core/domain/types/common";
import {
  type IInventoryRepository,
  type InventoryBalanceResult,
} from "../interfaces/IInventoryRepository";

/**
 *
 */
export class InventoryService {
  /**
   *
   */
  constructor(private inventoryRepository: IInventoryRepository) {}

  /**
   * Gets the total available stock for a variant across all warehouses.
   */
  async getTotalAvailableStock(variantId: ID): Promise<number> {
    const balances = await this.inventoryRepository.getAllBalances(variantId);
    return balances.reduce((total, bal) => total + bal.available, 0);
  }

  /**
   * Gets all warehouse balances for a variant.
   */
  async getWarehouseBalances(variantId: ID): Promise<InventoryBalanceResult[]> {
    return this.inventoryRepository.getAllBalances(variantId);
  }

  /**
   * Checks if a variant is in stock (at least 1 item available).
   */
  async isInStock(variantId: ID): Promise<boolean> {
    const stock = await this.getTotalAvailableStock(variantId);
    return stock > 0;
  }
}
