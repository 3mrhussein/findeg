import type { InventoryAdjustment } from './contracts.js';

export class InventoryVariantNotFoundError extends Error {
  constructor() {
    super('Inventory variant not found');
    this.name = 'InventoryVariantNotFoundError';
  }
}

export interface InventoryStore {
  adjustOnHand(
    input: InventoryAdjustment,
  ): Promise<'adjusted' | 'insufficient-stock' | 'not-found'>;
  availabilityFor(variantIds: readonly number[]): Promise<ReadonlyMap<number, number>>;
}

export interface InventoryReservations {
  reserve(
    reference: string,
    items: readonly { variantId: number; quantity: number }[],
  ): Promise<boolean>;
}

export function isInventoryAdjustment(value: unknown): value is InventoryAdjustment {
  const candidate = value as Record<string, unknown>;
  return (
    !!value &&
    typeof value === 'object' &&
    'variantId' in value &&
    Number.isSafeInteger(candidate.variantId) &&
    (candidate.variantId as number) > 0 &&
    'warehouseId' in value &&
    Number.isSafeInteger(candidate.warehouseId) &&
    (candidate.warehouseId as number) > 0 &&
    'quantityDelta' in value &&
    Number.isSafeInteger(candidate.quantityDelta) &&
    candidate.quantityDelta !== 0 &&
    'actorId' in value &&
    Number.isSafeInteger(candidate.actorId) &&
    (candidate.actorId as number) > 0 &&
    (!('notes' in value) || value.notes === undefined || typeof value.notes === 'string')
  );
}

export type { InventoryAdjustment } from './contracts.js';

export interface InventoryFulfillment {
  deliver(reference: string, actorId: number): Promise<boolean>;
}
