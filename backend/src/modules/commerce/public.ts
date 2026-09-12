import type {
  AcceptedOrder,
  CartItem,
  CartQuote,
  DeliveryAddress,
  CheckoutInput,
  DeliveryZone,
  PricedItem,
} from './contracts.js';
import type { LocalizedStorefrontVariant } from '@findeg/backend/modules/catalog/contracts';

export interface CommerceStore {
  readCart(ownerDigest: string): Promise<readonly CartItem[]>;
  replaceCart(ownerDigest: string, items: readonly CartItem[]): Promise<void>;
  deliveryZones(): Promise<readonly DeliveryZone[]>;
  deliveryZone(id: number): Promise<DeliveryZone | undefined>;
  outcome(
    ownerDigest: string,
    key: string,
  ): Promise<{ fingerprint: string; order: AcceptedOrder } | undefined>;
  accept(
    order: AcceptedOrder,
    ownerDigest: string,
    key: string,
    fingerprint: string,
    access: { codeHash: string; expiresAt: Date },
  ): Promise<void>;
  readOrder(reference: string): Promise<AcceptedOrder | undefined>;
  verifyGuestAccess(reference: string, codeHash: string): Promise<AcceptedOrder | undefined>;
}

export function checkoutInput(input: unknown): CheckoutInput | undefined {
  if (!input || typeof input !== 'object') return;
  const value = input as Record<string, unknown>;
  if (
    Object.keys(value).some(
      (key) => !['key', 'confirmation', 'address', 'paymentMethod', 'deliveryMethod'].includes(key),
    ) ||
    typeof value.key !== 'string' ||
    !/^[a-zA-Z0-9_-]{16,128}$/.test(value.key) ||
    typeof value.confirmation !== 'string' ||
    !/^[a-f0-9]{64}$/.test(value.confirmation) ||
    value.paymentMethod !== 'cash-on-delivery' ||
    value.deliveryMethod !== 'home-delivery' ||
    !value.address ||
    typeof value.address !== 'object'
  )
    return;
  const address = value.address as Record<string, unknown>;
  if (
    Object.keys(address).some(
      (key) => !['name', 'email', 'phone', 'street', 'city', 'zoneId'].includes(key),
    ) ||
    !Number.isSafeInteger(address.zoneId) ||
    Number(address.zoneId) <= 0
  )
    return;
  for (const key of ['name', 'email', 'phone', 'street', 'city']) {
    if (typeof address[key] !== 'string' || !address[key].trim() || address[key].length > 255)
      return;
  }
  const { name, email, phone, street, city } = address as unknown as DeliveryAddress;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^(?:\+20|0)1[0125]\d{8}$/.test(phone)) return;
  return {
    key: value.key,
    confirmation: value.confirmation,
    paymentMethod: value.paymentMethod,
    deliveryMethod: value.deliveryMethod,
    address: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      street: street.trim(),
      city: city.trim(),
      zoneId: Number(address.zoneId),
    },
  };
}

export function egpMinor(value: string): bigint {
  if (!/^\d{1,12}(?:\.\d{1,2})?$/.test(value)) throw new Error('Invalid EGP amount');
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}

export function formatEgp(value: bigint): string {
  return `${value / 100n}.${(value % 100n).toString().padStart(2, '0')}`;
}

export function priceCart(
  items: readonly CartItem[],
  variants: readonly LocalizedStorefrontVariant[],
  availability: ReadonlyMap<number, number>,
):
  | { status: 'quoted'; quote: CartQuote }
  | { status: 'variant-unavailable' | 'insufficient-stock' } {
  const priced: PricedItem[] = [];
  let total = 0n;
  for (const item of items) {
    const variant = variants.find((candidate) => candidate.id === item.variantId);
    if (!variant) return { status: 'variant-unavailable' };
    if ((availability.get(item.variantId) ?? 0) < item.quantity)
      return { status: 'insufficient-stock' };
    const unit = egpMinor(variant.price);
    const line = unit * BigInt(item.quantity);
    total += line;
    priced.push({
      ...item,
      sku: variant.sku,
      name: variant.name,
      label: variant.label,
      unitPrice: formatEgp(unit),
      lineTotal: formatEgp(line),
    });
  }
  return { status: 'quoted', quote: { items: priced, subtotal: formatEgp(total) } };
}

export function validateCart(input: unknown): readonly CartItem[] | undefined {
  if (
    !input ||
    typeof input !== 'object' ||
    Object.keys(input).some((key) => key !== 'items') ||
    !('items' in input) ||
    !Array.isArray(input.items) ||
    input.items.length > 100
  )
    return;
  const items: CartItem[] = [];
  for (const item of input.items) {
    if (
      !item ||
      typeof item !== 'object' ||
      Object.keys(item).some((key) => !['variantId', 'quantity'].includes(key)) ||
      !Number.isSafeInteger(item.variantId) ||
      item.variantId <= 0 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 999 ||
      items.some((previous) => previous.variantId === item.variantId)
    )
      return;
    items.push({ variantId: item.variantId, quantity: item.quantity });
  }
  return items.sort((left, right) => left.variantId - right.variantId);
}
