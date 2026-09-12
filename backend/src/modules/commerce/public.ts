import type {
  GuestOrderRecord,
  GuestOrderRequest,
  GuestOrderLine,
  GuestOrderItemInput,
} from './contracts.js';

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
