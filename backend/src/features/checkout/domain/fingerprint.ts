import { createHash } from 'node:crypto';
import type { ShippingAddress } from '@findeg/db/types';

export interface OrderFingerprintInput {
  lines: Array<{ variantId: number; quantity: number }>;
  address: ShippingAddress;
  paymentMethod: string;
  deliveryMethod?: string;
  confirmation: string;
}

/**
 * Computes a deterministic SHA-256 fingerprint over normalized checkout terms (ADR-0005).
 * Covers normalized lines, address, payment method, delivery method, and confirmation.
 */
export function computeOrderFingerprint(input: OrderFingerprintInput): string {
  const quantitiesByVariant = new Map<number, number>();
  for (const line of input.lines) {
    quantitiesByVariant.set(
      line.variantId,
      (quantitiesByVariant.get(line.variantId) ?? 0) + line.quantity,
    );
  }

  const normalizedLines = [...quantitiesByVariant.entries()]
    .sort(([a], [b]) => a - b)
    .map(([variantId, quantity]) => ({ variantId, quantity }));

  const normalizedAddress = {
    fullName: input.address.fullName?.trim() ?? '',
    phone: input.address.phone?.trim() ?? '',
    city: input.address.city?.trim() ?? '',
    area: input.address.area?.trim() ?? '',
    street: input.address.street?.trim() ?? '',
    building: input.address.building?.trim() || null,
    floor: input.address.floor?.trim() || null,
    apartment: input.address.apartment?.trim() || null,
    notes: input.address.notes?.trim() || null,
  };

  const payload = {
    lines: normalizedLines,
    address: normalizedAddress,
    paymentMethod: input.paymentMethod,
    deliveryMethod: input.deliveryMethod ?? 'standard',
    confirmation: input.confirmation,
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
