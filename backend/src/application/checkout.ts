import type { TransactionRunner } from './transactions.js';
import type { CatalogCheckoutStore } from '@findeg/backend/modules/catalog/public';
import type {
  InventoryReservations,
  InventoryStore,
} from '@findeg/backend/modules/inventory/public';
import {
  checkoutInput,
  egpMinor,
  formatEgp,
  priceCart,
  validateCart,
  type CommerceStore,
} from '@findeg/backend/modules/commerce/public';
import type { AcceptedOrder, CartItem } from '@findeg/backend/modules/commerce/contracts';

export interface CheckoutStores {
  commerce: CommerceStore;
  inventory: InventoryStore;
  checkoutCatalog: CatalogCheckoutStore;
  reservations: InventoryReservations;
  outbox: {
    enqueue(
      id: string,
      kind: 'order-accepted' | 'guest-order-code',
      payload: Readonly<Record<string, unknown>>,
    ): Promise<void>;
  };
}

export interface CheckoutSecurity {
  digest(value: string): string;
  randomToken(): string;
  verificationCode(): string;
}

export function createStorefrontCommerce(
  transactions: TransactionRunner<CheckoutStores>,
  security: CheckoutSecurity,
) {
  async function run<Value extends { status: string }>(
    operation: (stores: CheckoutStores) => Promise<Value>,
  ): Promise<Value> {
    const result = await transactions.run<Value, Value>(async (stores) => {
      const value = await operation(stores);
      return ['quoted', 'accepted', 'available', 'verified'].includes(value.status)
        ? { ok: true, value }
        : { ok: false, error: value };
    });
    return result.ok ? result.value : result.error;
  }

  const quote = async (stores: CheckoutStores, items: readonly CartItem[]) =>
    priceCart(
      items,
      await stores.checkoutCatalog.readEligible(items.map((item) => item.variantId)),
      await stores.inventory.availabilityFor(items.map((item) => item.variantId)),
    );

  async function checkoutQuote(stores: CheckoutStores, ownerDigest: string, zoneId: number) {
    const items = await stores.commerce.readCart(ownerDigest);
    if (!items.length) return { status: 'empty-cart' } as const;
    const zone = await stores.commerce.deliveryZone(zoneId);
    if (!zone) return { status: 'delivery-unavailable' } as const;
    const priced = await quote(stores, items);
    if (priced.status !== 'quoted') return priced;
    const terms = {
      ...priced.quote,
      zone,
      total: formatEgp(egpMinor(priced.quote.subtotal) + egpMinor(zone.fee)),
    };
    return {
      status: 'quoted',
      ...terms,
      confirmation: security.digest(JSON.stringify(terms)),
    } as const;
  }

  function receipt(order: AcceptedOrder) {
    return {
      status: 'accepted',
      reference: order.reference,
      accessReference: order.guestAccess.reference,
      total: order.total,
    } as const;
  }

  return {
    deliveryZones: () =>
      run(
        async (stores) =>
          ({ status: 'available', zones: await stores.commerce.deliveryZones() }) as const,
      ),

    async quoteCheckout(ownerDigest: string, zoneId: number) {
      if (!/^[a-f0-9]{64}$/.test(ownerDigest) || !Number.isSafeInteger(zoneId) || zoneId <= 0) {
        return { status: 'invalid-input' } as const;
      }
      return run((stores) => checkoutQuote(stores, ownerDigest, zoneId));
    },

    async acceptCheckout(ownerDigest: string, input: unknown) {
      const value = checkoutInput(input);
      if (!value || !/^[a-f0-9]{64}$/.test(ownerDigest))
        return { status: 'invalid-input' } as const;
      const fingerprint = security.digest(JSON.stringify(value));
      return run(async (stores) => {
        // The transaction-bound Cart row lock serializes retries for this guest across processes.
        const items = await stores.commerce.readCart(ownerDigest);
        const saved = await stores.commerce.outcome(ownerDigest, value.key);
        if (saved) {
          return saved.fingerprint === fingerprint
            ? receipt(saved.order)
            : ({ status: 'idempotency-conflict' } as const);
        }
        const quoted = await checkoutQuote(stores, ownerDigest, value.address.zoneId);
        if (quoted.status !== 'quoted') return quoted;
        if (quoted.confirmation !== value.confirmation) {
          return { status: 'reconfirmation-required' } as const;
        }
        const accepted = await acceptOrder(
          stores,
          security,
          {
            items: quoted.items,
            subtotal: quoted.subtotal,
            deliveryFee: quoted.zone.fee,
            total: quoted.total,
            address: value.address,
          },
          ownerDigest,
          value.key,
          fingerprint,
        );
        if (accepted.status !== 'accepted') return accepted;
        if (items.length) await stores.commerce.replaceCart(ownerDigest, []);
        return accepted;
      });
    },

    async replaceCart(ownerDigest: string, input: unknown) {
      const items = validateCart(input);
      if (!items || !/^[a-f0-9]{64}$/.test(ownerDigest))
        return { status: 'invalid-input' } as const;
      return run(async (stores) => {
        const result = await quote(stores, items);
        if (result.status === 'quoted') await stores.commerce.replaceCart(ownerDigest, items);
        return result;
      });
    },

    async readCart(ownerDigest: string) {
      if (!/^[a-f0-9]{64}$/.test(ownerDigest)) return { status: 'invalid-input' } as const;
      return run(async (stores) => quote(stores, await stores.commerce.readCart(ownerDigest)));
    },

    async verifyGuestOrder(reference: string, code: string) {
      if (!/^[a-f0-9]{32,128}$/.test(reference) || !/^\d{6}$/.test(code)) {
        return { status: 'invalid-input' } as const;
      }
      return run(async (stores) => {
        const order = await stores.commerce.verifyGuestAccess(reference, security.digest(code));
        return order
          ? ({ status: 'verified', order } as const)
          : ({ status: 'not-found' } as const);
      });
    },
  };
}

/** Commits required acceptance facts through transaction-bound stores supplied by the source workflow. */
export async function acceptOrder(
  stores: CheckoutStores,
  security: CheckoutSecurity,
  terms: Pick<AcceptedOrder, 'items' | 'subtotal' | 'deliveryFee' | 'total' | 'address'>,
  ownerDigest: string,
  key: string,
  fingerprint: string,
) {
  const order: AcceptedOrder = {
    ...terms,
    reference: security.randomToken(),
    status: 'accepted',
    paymentMethod: 'cash-on-delivery',
    paymentStatus: 'unpaid',
    deliveryMethod: 'home-delivery',
    guestAccess: { reference: security.randomToken() },
  };
  const verificationCode = security.verificationCode();
  await stores.commerce.accept(order, ownerDigest, key, fingerprint, {
    codeHash: security.digest(verificationCode),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
  if (!(await stores.reservations.reserve(order.reference, reservationItems(order.items))))
    return { status: 'insufficient-stock' } as const;
  await stores.outbox.enqueue(`order:${order.reference}`, 'order-accepted', {
    reference: order.reference,
    email: order.address.email,
  });
  await stores.outbox.enqueue(`guest-access:${order.guestAccess.reference}`, 'guest-order-code', {
    reference: order.guestAccess.reference,
    code: verificationCode,
    email: order.address.email,
  });
  return {
    status: 'accepted',
    reference: order.reference,
    accessReference: order.guestAccess.reference,
    total: order.total,
  } as const;
}

export function reservationItems(items: readonly CartItem[]) {
  const quantities = new Map<number, number>();
  for (const item of items)
    quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
  return [...quantities]
    .sort(([a], [b]) => a - b)
    .map(([variantId, quantity]) => ({ variantId, quantity }));
}
