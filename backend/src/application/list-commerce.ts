import {
  valueRewardLine,
  type DurablePartnerRewardStore,
} from '@findeg/backend/modules/partner-rewards/public';
import type { PricedItem } from '@findeg/backend/modules/commerce/contracts';
import type { TransactionRunner } from './transactions.js';
import {
  acceptOrder,
  reservationItems,
  type CheckoutSecurity,
  type CheckoutStores,
} from './checkout.js';
import {
  allowedAlternatives,
  type SchoolSupplyListStore,
} from '@findeg/backend/modules/school-supply-lists/public';
import {
  checkoutInput,
  egpMinor,
  formatEgp,
  priceListSelection,
  validateListSelection,
  type ListSelectionStore,
} from '@findeg/backend/modules/commerce/public';
import type { AcceptedOrder, ListSelection } from '@findeg/backend/modules/commerce/contracts';
import type { CatalogListStore } from '@findeg/backend/modules/catalog/public';

export interface ListCommerceStores extends CheckoutStores {
  rewards: DurablePartnerRewardStore;
  schoolSupplyLists: SchoolSupplyListStore;
  selections: ListSelectionStore;
  listCatalog: CatalogListStore;
}
export function createListCommerce(
  transactions: TransactionRunner<ListCommerceStores>,
  security: CheckoutSecurity,
) {
  async function run<Value extends { status: string }>(
    operation: (stores: ListCommerceStores) => Promise<Value>,
  ): Promise<Value> {
    const result = await transactions.run<Value, Value>(async (stores) => {
      const value = await operation(stores);
      return ['found', 'quoted', 'accepted'].includes(value.status)
        ? { ok: true, value }
        : { ok: false, error: value };
    });
    return result.ok ? result.value : result.error;
  }
  const valid = (owner: string, code: string) =>
    /^[a-f0-9]{64}$/.test(owner) && /^[a-zA-Z0-9_-]{16,128}$/.test(code);
  async function load(
    stores: ListCommerceStores,
    owner: string,
    code: string,
    replacement?: ListSelection,
  ) {
    const list = await stores.schoolSupplyLists.byPublicCode(code);
    if (!list) return { status: 'not-found' } as const;
    const previous = await stores.selections.read(owner, list.id, {
      setCount: 1,
      items: list.items
        .filter((item) => list.status === 'published' && item.required !== false)
        .map((item) => ({
          listItemId: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
    });
    if (replacement && (list.status !== 'published' || list.replacedById))
      return { status: 'list-unavailable' } as const;
    const selection = replacement ?? previous;
    const variants = await stores.listCatalog.readEligible();
    const options = list.items.map((item) => ({
      listItemId: item.id,
      variants: allowedAlternatives(item, variants),
    }));
    const eligible = selection.items.every((choice) =>
      options
        .find((option) => option.listItemId === choice.listItemId)
        ?.variants.some((variant) => variant.id === choice.variantId),
    );
    if (replacement && !eligible) return { status: 'selection-unavailable' } as const;
    if (replacement) await stores.selections.replace(owner, list.id, selection);
    const offerBasisPoints = await stores.selections.offer(list.id);
    return {
      status: 'found',
      list,
      selection,
      options,
      offerBasisPoints,
      pricing: eligible
        ? priceListSelection(list, selection, variants, offerBasisPoints)
        : undefined,
    } as const;
  }
  async function quote(stores: ListCommerceStores, owner: string, code: string, zoneId: number) {
    const loaded = await load(stores, owner, code);
    if (loaded.status !== 'found') return loaded;
    if (loaded.list.status !== 'published' || loaded.list.replacedById)
      return { status: 'list-unavailable' } as const;
    if (!loaded.selection.items.length) return { status: 'empty-selection' } as const;
    if (!loaded.pricing) return { status: 'selection-unavailable' } as const;
    const zone = await stores.commerce.deliveryZone(zoneId);
    if (!zone) return { status: 'delivery-unavailable' } as const;
    const items = reservationItems(loaded.selection.items);
    const availability = await stores.inventory.availabilityFor(
      items.map((item) => item.variantId),
    );
    if (items.some((item) => (availability.get(item.variantId) ?? 0) < item.quantity))
      return { status: 'insufficient-stock' } as const;
    const rate = await stores.rewards.rateForPartner(loaded.list.businessPartnerId);
    if (!rate) return { status: 'reward-rate-unavailable' } as const;
    const rewardedItems: (PricedItem & { reward: NonNullable<PricedItem['reward']> })[] = [];
    for (const item of loaded.pricing.items) {
      const reward = valueRewardLine(rate, item.lineTotal);
      if (!reward) return { status: 'reward-rate-unavailable' } as const;
      rewardedItems.push({ ...item, reward });
    }
    const terms = {
      ...loaded.pricing,
      items: rewardedItems,
      zone,
      total: formatEgp(egpMinor(loaded.pricing.subtotal) + egpMinor(zone.fee)),
      listId: loaded.list.id,
      selection: loaded.selection,
    };
    return {
      status: 'quoted',
      ...terms,
      confirmation: security.digest(JSON.stringify(terms)),
    } as const;
  }
  const receipt = (order: AcceptedOrder) =>
    ({
      status: 'accepted',
      reference: order.reference,
      accessReference: order.guestAccess.reference,
      total: order.total,
    }) as const;
  return {
    async read(owner: string, code: string) {
      if (!valid(owner, code)) return { status: 'invalid-input' } as const;
      return run((stores) => load(stores, owner, code));
    },
    async replace(owner: string, code: string, input: unknown) {
      const selection = validateListSelection(input);
      if (!valid(owner, code) || !selection) return { status: 'invalid-input' } as const;
      return run((stores) => load(stores, owner, code, selection));
    },
    async quoteCheckout(owner: string, code: string, zoneId: number) {
      if (!valid(owner, code) || !Number.isSafeInteger(zoneId) || zoneId < 1)
        return { status: 'invalid-input' } as const;
      return run((stores) => quote(stores, owner, code, zoneId));
    },
    async acceptCheckout(owner: string, code: string, input: unknown) {
      const value = checkoutInput(input);
      if (!valid(owner, code) || !value) return { status: 'invalid-input' } as const;
      const scope = security.digest(`list-selection:${owner}:${code}`);
      const fingerprint = security.digest(JSON.stringify(value));
      return run(async (stores) => {
        // Lock the source before the selection, the same order used by reads and replacement.
        const list = await stores.schoolSupplyLists.byPublicCode(code);
        if (!list) return { status: 'not-found' } as const;
        await stores.selections.read(owner, list.id, { setCount: 1, items: [] });
        const saved = await stores.commerce.outcome(scope, value.key);
        if (saved)
          return saved.fingerprint === fingerprint
            ? receipt(saved.order)
            : ({ status: 'idempotency-conflict' } as const);
        const quoted = await quote(stores, owner, code, value.address.zoneId);
        if (quoted.status !== 'quoted') return quoted;
        if (quoted.confirmation !== value.confirmation)
          return { status: 'reconfirmation-required' } as const;
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
          scope,
          value.key,
          fingerprint,
        );
        if (accepted.status !== 'accepted') return accepted;
        await stores.rewards.recordPending(
          accepted.reference,
          quoted.items.map((item, lineIndex) => ({
            lineIndex,
            businessPartnerId: list.businessPartnerId,
            eligibleSubtotal: item.lineTotal,
            reward: item.reward,
          })),
        );
        await stores.selections.replace(owner, list.id, {
          setCount: quoted.selection.setCount,
          items: [],
        });
        return accepted;
      });
    },
  };
}
