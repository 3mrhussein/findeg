import type {
  GuestOrderRecord,
  GuestOrderRequest,
  GuestOrderLine,
  GuestOrderItemInput,
} from './contracts.js';
import type {
  AcceptedOrder,
  CartItem,
  CartQuote,
  DeliveryAddress,
  DeliveryZone,
  PricedItem,
} from './contracts.js';
import type { LocalizedStorefrontVariant } from '@findeg/backend/modules/catalog/contracts';

export interface CommerceStore {
  readCart(ownerDigest: string): Promise<readonly CartItem[]>;
  replaceCart(ownerDigest: string, items: readonly CartItem[]): Promise<void>;
  deliveryZones(): Promise<readonly DeliveryZone[]>;
  deliveryZone(id: number): Promise<DeliveryZone | undefined>;
  outcome(ownerDigest: string, key: string): Promise<{ fingerprint: string; order: AcceptedOrder } | undefined>;
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

export interface CheckoutInput {
  readonly key: string;
  readonly confirmation: string;
  readonly address: DeliveryAddress;
  readonly paymentMethod: 'cash-on-delivery';
  readonly deliveryMethod: 'home-delivery';
}

export function checkoutInput(input: unknown): CheckoutInput | undefined {
  if (!input || typeof input !== 'object') return;
  const value = input as Record<string, unknown>;
  if (
    Object.keys(value).some((key) => !['key', 'confirmation', 'address', 'paymentMethod', 'deliveryMethod'].includes(key)) ||
    typeof value.key !== 'string' ||
    !/^[a-zA-Z0-9_-]{16,128}$/.test(value.key) ||
    typeof value.confirmation !== 'string' ||
    !/^[a-f0-9]{64}$/.test(value.confirmation) ||
    value.paymentMethod !== 'cash-on-delivery' ||
    value.deliveryMethod !== 'home-delivery' ||
    !value.address ||
    typeof value.address !== 'object'
  ) return;
  const address = value.address as Record<string, unknown>;
  if (
    Object.keys(address).some((key) => !['name', 'email', 'phone', 'street', 'city', 'zoneId'].includes(key)) ||
    !Number.isSafeInteger(address.zoneId) ||
    Number(address.zoneId) <= 0
  ) return;
  for (const key of ['name', 'email', 'phone', 'street', 'city']) {
    if (typeof address[key] !== 'string' || !address[key].trim() || address[key].length > 255) return;
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
): { status: 'quoted'; quote: CartQuote } | { status: 'variant-unavailable' | 'insufficient-stock' } {
  const priced: PricedItem[] = [];
  let total = 0n;
  for (const item of items) {
    const variant = variants.find((candidate) => candidate.id === item.variantId);
    if (!variant) return { status: 'variant-unavailable' };
    if ((availability.get(item.variantId) ?? 0) < item.quantity) return { status: 'insufficient-stock' };
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
  ) return;
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
    ) return;
    items.push({ variantId: item.variantId, quantity: item.quantity });
  }
  return items.sort((left, right) => left.variantId - right.variantId);
}

export interface CatalogVariantSnapshot {
  readonly id: number;
  readonly sku: string;
  readonly name: string;
  readonly label: string;
  readonly price: string;
  readonly strikePrice?: string;
  readonly isActive: boolean;
}

export interface CatalogStore {
  listActiveVariants(): Promise<readonly CatalogVariantSnapshot[]>;
}

export interface InventoryStore {
  availabilityFor(variantIds: readonly number[]): Promise<Map<number, number>>;
}

export interface GuestOrderStore {
  findOrderByIdempotencyKey(key: string): Promise<GuestOrderRecord | undefined>;
  storeOrder(record: GuestOrderRecord): Promise<GuestOrderRecord>;
  findOrderByReference(reference: string): Promise<GuestOrderRecord | undefined>;
  consumeGuestAccess(reference: string, verificationCode: string): Promise<boolean>;
}

export interface GuestAccessFactory {
  reference(): string;
  verificationCode(): string;
  now(): Date;
}

export function createCommerce(
  store: GuestOrderStore,
  catalog: CatalogStore,
  inventory: InventoryStore,
  security: GuestAccessFactory,
) {
  const roundToCents = (value: string) => {
    const safe = Number(value);
    return Number.isFinite(safe) ? safe.toFixed(2) : '0.00';
  };

  const moneyToNumber = (value: string) => Number(value || '0.00');
  const inFlightByKey = new Map<string, Promise<GuestOrderRecord | undefined>>();

  const fingerprint = (input: GuestOrderRequest) => {
    const normalized = {
      email: input.email.trim().toLowerCase(),
      paymentMethod: input.paymentMethod,
      customer: input.customer,
      shippingAddress: input.shippingAddress,
      items: [...input.items]
        .map(({ variantId, quantity }) => ({ variantId, quantity }))
        .sort((a, b) => a.variantId - b.variantId || a.quantity - b.quantity),
    };
    return JSON.stringify(normalized);
  };

  const priceForItems = async (items: readonly GuestOrderItemInput[]) => {
    const variants = await catalog.listActiveVariants();
    const byId = new Map(variants.map((variant) => [variant.id, variant]));

    const quantities = new Map<number, number>();
    for (const item of items) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
        throw new Error('invalid-quantity');
      }
      quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
    }

    const availableByVariant = await inventory.availabilityFor([...quantities.keys()]);
    const lines: GuestOrderLine[] = [];
    let total = 0;

    for (const [variantId, quantity] of quantities) {
      const item = { variantId, quantity };
      const variant = byId.get(item.variantId);
      if (!variant || !variant.isActive) {
        throw new Error('variant-unavailable');
      }

      const available = availableByVariant.get(item.variantId) ?? 0;
      if (available < item.quantity) {
        throw new Error('insufficient-stock');
      }

      const unit = roundToCents(variant.price);
      const lineTotal = roundToCents(String(moneyToNumber(unit) * item.quantity));
      total += moneyToNumber(lineTotal);
      lines.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: unit,
        total: lineTotal,
      });
    }

    return { lines, total: roundToCents(String(total)) };
  };

  async function acceptGuestCashOnDeliveryOrder(input: GuestOrderRequest) {
    if (!input || typeof input.idempotencyKey !== 'string' || !input.idempotencyKey.trim()) {
      return { status: 'invalid-input' } as const;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      return { status: 'invalid-input' } as const;
    }
    if (input.paymentMethod !== 'cod') {
      return { status: 'invalid-input' } as const;
    }

    const payloadHash = fingerprint(input);
    const existing = await store.findOrderByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      if (existing.payloadHash !== payloadHash) {
        return { status: 'idempotency-mismatch' } as const;
      }
      return { status: 'replayed', order: existing } as const;
    }

    const pending = inFlightByKey.get(input.idempotencyKey);
    if (pending) {
      const order = await pending;
      if (order?.payloadHash !== payloadHash) {
        return { status: 'idempotency-mismatch' } as const;
      }
      return order
        ? ({ status: 'replayed', order } as const)
        : ({ status: 'invalid-input' } as const);
    }

    const creation = (async () => {
      try {
        const { lines, total } = await priceForItems(input.items);
        const record: GuestOrderRecord = {
          id: `ord_${security.reference()}`,
          idempotencyKey: input.idempotencyKey,
          payloadHash,
          email: input.email.trim().toLowerCase(),
          customer: {
            ...input.customer,
            fullName: input.customer.fullName.trim(),
            phone: input.customer.phone.trim(),
            city: input.customer.city.trim(),
            area: input.customer.area.trim(),
            street: input.customer.street.trim(),
          },
          shippingAddress: {
            ...input.shippingAddress,
            city: input.shippingAddress.city.trim(),
            area: input.shippingAddress.area.trim(),
            street: input.shippingAddress.street.trim(),
          },
          items: lines,
          total,
          reservation: {
            status: 'reserved',
            createdAt: security.now().toISOString(),
          },
          paymentMethod: 'cod',
          guestAccess: {
            reference: security.reference(),
            verificationCode: security.verificationCode(),
            used: false,
          },
          createdAt: security.now().toISOString(),
          status: 'accepted',
        };
        const saved = await store.storeOrder(record);
        return saved;
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message === 'variant-unavailable' ||
            error.message === 'invalid-quantity' ||
            error.message === 'insufficient-stock')
        ) {
          return undefined;
        }
        throw error;
      }
    })();
    inFlightByKey.set(input.idempotencyKey, creation);
    try {
      const order = await creation;
      return order
        ? ({ status: 'accepted', order } as const)
        : ({ status: 'invalid-input' } as const);
    } finally {
      inFlightByKey.delete(input.idempotencyKey);
    }
  }

  async function readGuestOrder(reference: string) {
    if (typeof reference !== 'string' || reference.trim().length === 0) {
      return { status: 'not-found' } as const;
    }
    const found = await store.findOrderByReference(reference.trim());
    return found
      ? ({ status: 'verification-required' } as const)
      : ({ status: 'not-found' } as const);
  }

  async function verifyGuestOrderAccess(reference: string, verificationCode: string) {
    const order = await store.findOrderByReference(reference);
    if (!order) return { status: 'not-found' } as const;
    if (order.guestAccess.used) return { status: 'verification-used' } as const;
    const verified = await store.consumeGuestAccess(reference, verificationCode);
    if (!verified) return { status: 'invalid-verification' } as const;
    return { status: 'verified', order } as const;
  }

  return {
    acceptGuestCashOnDeliveryOrder,
    readGuestOrder,
    verifyGuestOrderAccess,
  };
}
