import { and, eq, isNull, gt } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import { acceptedOrders, checkoutOutcomes, deliveryZones, guestOrderAccess, storefrontCarts } from '@findeg/db/modules/commerce';
import type { AcceptedOrder, CartItem, DeliveryZone } from '../contracts.js';
import type { CommerceStore } from '../public.js';

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
        .where(and(eq(guestOrderAccess.reference, reference), eq(guestOrderAccess.codeHash, codeHash), isNull(guestOrderAccess.usedAt), gt(guestOrderAccess.expiresAt, new Date())))
        .for('update');
      if (!access) return undefined;
      const [claimed] = await database
        .update(guestOrderAccess)
        .set({ usedAt: new Date() })
        .where(and(eq(guestOrderAccess.reference, reference), eq(guestOrderAccess.codeHash, codeHash), isNull(guestOrderAccess.usedAt), gt(guestOrderAccess.expiresAt, new Date())))
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
