import { and, eq, isNull, gt } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import {
  listOffers,
  listSelections,
  acceptedOrders,
  checkoutOutcomes,
  deliveryZones,
  guestOrderAccess,
  storefrontCarts,
} from '@findeg/db/modules/commerce';
import type { AcceptedOrder, CartItem, DeliveryZone, ListSelection } from '../contracts.js';
import type { CommerceStore, ListSelectionStore } from '../public.js';

export function bindCommerceStore(database: TransactionDatabase): CommerceStore {
  const selectZone = () => ({
    id: deliveryZones.id,
    name: deliveryZones.name,
    fee: deliveryZones.fee,
  });

  return {
    async deliveryZones() {
      return database
        .select(selectZone())
        .from(deliveryZones)
        .where(eq(deliveryZones.isActive, true))
        .orderBy(deliveryZones.id);
    },
    async deliveryZone(id) {
      const [zone] = await database
        .select(selectZone())
        .from(deliveryZones)
        .where(and(eq(deliveryZones.id, id), eq(deliveryZones.isActive, true)))
        .for('share');
      return zone as DeliveryZone | undefined;
    },
    async outcome(ownerDigest, key) {
      const [row] = await database
        .select({ fingerprint: checkoutOutcomes.fingerprint, snapshot: acceptedOrders.snapshot })
        .from(checkoutOutcomes)
        .innerJoin(acceptedOrders, eq(checkoutOutcomes.orderReference, acceptedOrders.reference))
        .where(and(eq(checkoutOutcomes.ownerDigest, ownerDigest), eq(checkoutOutcomes.key, key)));
      return row
        ? { fingerprint: row.fingerprint, order: row.snapshot as AcceptedOrder }
        : undefined;
    },
    async accept(order, ownerDigest, key, fingerprint, access) {
      await database.insert(acceptedOrders).values({ reference: order.reference, snapshot: order });
      await database.insert(checkoutOutcomes).values({
        ownerDigest,
        key,
        fingerprint,
        orderReference: order.reference,
      });
      await database.insert(guestOrderAccess).values({
        reference: order.guestAccess.reference,
        orderReference: order.reference,
        codeHash: access.codeHash,
        expiresAt: access.expiresAt,
      });
    },
    async readOrder(reference) {
      const [row] = await database
        .select()
        .from(acceptedOrders)
        .where(eq(acceptedOrders.reference, reference));
      return row?.snapshot as AcceptedOrder | undefined;
    },
    async verifyGuestAccess(reference, codeHash) {
      const [access] = await database
        .select({ order: acceptedOrders.snapshot })
        .from(guestOrderAccess)
        .innerJoin(acceptedOrders, eq(acceptedOrders.reference, guestOrderAccess.orderReference))
        .where(
          and(
            eq(guestOrderAccess.reference, reference),
            eq(guestOrderAccess.codeHash, codeHash),
            isNull(guestOrderAccess.usedAt),
            gt(guestOrderAccess.expiresAt, new Date()),
          ),
        )
        .for('update');
      if (!access) return undefined;
      const [claimed] = await database
        .update(guestOrderAccess)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(guestOrderAccess.reference, reference),
            eq(guestOrderAccess.codeHash, codeHash),
            isNull(guestOrderAccess.usedAt),
            gt(guestOrderAccess.expiresAt, new Date()),
          ),
        )
        .returning({ reference: guestOrderAccess.reference });
      return claimed ? (access.order as AcceptedOrder) : undefined;
    },
    async readCart(ownerDigest) {
      await database
        .insert(storefrontCarts)
        .values({ ownerDigest, items: [] })
        .onConflictDoNothing();
      const [cart] = await database
        .select()
        .from(storefrontCarts)
        .where(eq(storefrontCarts.ownerDigest, ownerDigest))
        .for('update');
      return cart.items as readonly CartItem[];
    },
    async replaceCart(ownerDigest, items) {
      await database
        .insert(storefrontCarts)
        .values({ ownerDigest, items })
        .onConflictDoUpdate({ target: storefrontCarts.ownerDigest, set: { items } });
    },
  };
}

export function bindListSelectionStore(
  database: TransactionDatabase,
  inactivityDays = 30,
): ListSelectionStore {
  return {
    async offer(listId) {
      await database.insert(listOffers).values({ listId }).onConflictDoNothing();
      const [offer] = await database
        .select()
        .from(listOffers)
        .where(eq(listOffers.listId, listId))
        .for('share');
      const now = new Date();
      return offer.startsAt <= now && (!offer.endsAt || now < offer.endsAt) ? offer.basisPoints : 0;
    },
    async read(owner, listId, initial) {
      await database
        .insert(listSelections)
        .values({ ownerDigest: owner, listId, selection: initial })
        .onConflictDoNothing();
      const [row] = await database
        .select()
        .from(listSelections)
        .where(and(eq(listSelections.ownerDigest, owner), eq(listSelections.listId, listId)))
        .for('update');
      const selection =
        row.updatedAt.getTime() <= Date.now() - inactivityDays * 86400000
          ? initial
          : (row.selection as ListSelection);
      await database
        .update(listSelections)
        .set({ selection, updatedAt: new Date() })
        .where(and(eq(listSelections.ownerDigest, owner), eq(listSelections.listId, listId)));
      return selection;
    },
    async replace(owner, listId, selection) {
      await database
        .update(listSelections)
        .set({ selection, updatedAt: new Date() })
        .where(and(eq(listSelections.ownerDigest, owner), eq(listSelections.listId, listId)));
    },
  };
}
