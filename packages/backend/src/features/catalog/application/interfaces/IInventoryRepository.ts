/**
 * Inventory Repository Interface
 *
 * Defines the contract for variant-level inventory management.
 * All operations are at the variant + warehouse granularity.
 */

import { type ID, type Quantity } from "@features/core/domain/types/common";
import type { Variant } from "../../domain/entities/Variant";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InventoryBalanceResult {
  variantId: ID;
  warehouseId: ID;
  warehouseCode: string;
  onHand: number;
  reserved: number;
  /** Computed: onHand - reserved */
  available: number;
}

export interface StockMovementInput {
  movementType: "receipt" | "sale" | "adjustment" | "return" | "reserve" | "unreserve";
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdBy?: ID;
}

export interface LowStockResult {
  variant: Variant;
  balance: InventoryBalanceResult;
}

// ─── Interface ───────────────────────────────────────────────────────────────

export interface IInventoryRepository {
  /** Gets the balance for a variant at a specific warehouse (or the primary one) */
  getBalance(variantId: ID, warehouseId?: ID): Promise<InventoryBalanceResult | null>;

  /** Gets all warehouse balances for a variant */
  getAllBalances(variantId: ID): Promise<InventoryBalanceResult[]>;

  /** Adjusts stock and records a movement */
  adjustStock(variantId: ID, warehouseId: ID, movement: StockMovementInput): Promise<void>;

  /**
   * Reserves stock for a pending order.
   * Returns true if reservation succeeded, false if insufficient stock.
   */
  reserveStock(variantId: ID, warehouseId: ID, quantity: number, orderId: string): Promise<boolean>;

  /** Releases a previous reservation (e.g., order cancelled) */
  releaseReservation(
    variantId: ID,
    warehouseId: ID,
    quantity: number,
    orderId: string,
  ): Promise<void>;

  /** Gets variants with stock below their threshold */
  getLowStock(threshold?: number): Promise<LowStockResult[]>;
}
