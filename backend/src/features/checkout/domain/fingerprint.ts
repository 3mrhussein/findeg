import { createHash } from 'node:crypto';
import type { ShippingAddress } from '@findeg/db/types';

export interface OrderFingerprintInput {
  source?: 'cart' | 'list';
  publicCode?: string;
  lines: Array<{ listItemId?: number; variantId: number; quantity: number }>;
  address: ShippingAddress;
  paymentMethod: string;
  deliveryMethod?: string;
  confirmation: string;
  /** Normalized guest email; omit for signed-in orders. */
  guestEmail?: string;
}

/**
 * Computes a deterministic SHA-256 fingerprint over normalized checkout terms (ADR-0005).
 * Covers normalized lines, address, payment method, delivery method, confirmation, and guest email
 * (so a replay under a different email can never return another customer's receipt).
 */
export function computeOrderFingerprint(input: OrderFingerprintInput): string {
  const normalizedLines =
    input.source === 'list'
      ? input.lines
          .map((line) => ({
            listItemId: line.listItemId,
            variantId: line.variantId,
            quantity: line.quantity,
          }))
          .sort((a, b) => (a.listItemId ?? 0) - (b.listItemId ?? 0))
      : normalizeCartLines(input.lines);

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
    source: input.source ?? 'cart',
    publicCode: input.source === 'list' ? input.publicCode : null,
    lines: normalizedLines,
    address: normalizedAddress,
    paymentMethod: input.paymentMethod,
    deliveryMethod: input.deliveryMethod ?? 'standard',
    confirmation: input.confirmation,
    guestEmail: input.guestEmail?.trim().toLowerCase() || null,
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function normalizeCartLines(lines: OrderFingerprintInput['lines']) {
  const quantitiesByVariant = new Map<number, number>();
  for (const line of lines) {
    quantitiesByVariant.set(
      line.variantId,
      (quantitiesByVariant.get(line.variantId) ?? 0) + line.quantity,
    );
  }
  return [...quantitiesByVariant.entries()]
    .sort(([a], [b]) => a - b)
    .map(([variantId, quantity]) => ({ variantId, quantity }));
}
