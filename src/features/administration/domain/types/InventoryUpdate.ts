/**
 * Input for inventory updates
 */
export interface InventoryUpdate {
  productId: number;
  quantity: number;
  lowStockThreshold?: number;
}
