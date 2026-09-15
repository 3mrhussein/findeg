export interface InventoryAdjustment {
  readonly variantId: number;
  readonly warehouseId: number;
  readonly quantityDelta: number;
  readonly actorId: number;
  readonly notes?: string;
}
