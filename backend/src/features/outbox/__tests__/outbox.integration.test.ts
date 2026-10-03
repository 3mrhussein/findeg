import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import {
  categories,
  checkoutIdempotency,
  inventoryBalances,
  outbox,
  products,
  productVariants,
  warehouses,
} from '@findeg/db/schema';
import { outboxQueries } from '@findeg/db/queries';
import { createCheckoutService } from '../../checkout';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import {
  createOutbox,
  enqueue,
  isAuthorizedSweeper,
  type EmailProvider,
  type OutgoingEmail,
} from '../index';

class FakeEmailProvider implements EmailProvider {
  sent: OutgoingEmail[] = [];
  failures = 0;
  async send(email: OutgoingEmail) {
    if (this.failures > 0) {
      this.failures--;
      throw new Error('provider down');
    }
    this.sent.push(email);
  }
}

const { backoffSeconds } = outboxQueries;

describe('Outbox on real Postgres', () => {
  let testDb: TestDatabase;
  let sequence = 0;

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });
  afterAll(async () => testDb.close());
  beforeEach(async () => {
    await testDb.db.delete(outbox);
  });

  const enqueueRow = (id: string, kind = 'test', payload: Record<string, unknown> = {}) =>
    testDb.db.transaction((tx) => enqueue(tx as never, id, kind, payload));
  const rowOf = async (id: string) =>
    (await testDb.db.select().from(outbox).where(eq(outbox.id, id)))[0];
  const makeDue = (id: string) =>
    testDb.db
      .update(outbox)
      .set({ nextAttemptAt: sql`now() - interval '1 second'` })
      .where(eq(outbox.id, id));

  describe('enqueue', () => {
    it('is a no-op when the same id is enqueued twice', async () => {
      await enqueueRow('order-accepted:FE-AAAAAA', 'test', { orderId: 1 });
      await enqueueRow('order-accepted:FE-AAAAAA', 'test', { orderId: 2 });

      const rows = await testDb.db.select().from(outbox);
      expect(rows).toHaveLength(1);
      expect(rows[0].payload).toEqual({ orderId: 1 });
    });

    it('rolls back with the caller transaction', async () => {
      await testDb.db
        .transaction(async (tx) => {
          await enqueue(tx as never, 'rolled-back', 'test', {});
          throw new Error('boom');
        })
        .catch(() => {});
      expect(await rowOf('rolled-back')).toBeUndefined();
    });
  });

  describe('drain', () => {
    it('delivers a due row once', async () => {
      const calls: string[] = [];
      const service = createOutbox({
        handlers: {
          test: async (_p, { rowId }) => {
            calls.push(rowId);
            return 'delivered';
          },
        },
      });
      await enqueueRow('a');

      const result = await service.drain({ limit: 10 });
      await service.drain({ limit: 10 });

      expect(result).toMatchObject({ claimed: 1, delivered: 1 });
      expect(calls).toEqual(['a']);
      const row = await rowOf('a');
      expect(row).toMatchObject({ status: 'delivered', attempts: 1, leaseToken: null });
      expect(row.deliveredAt).toBeInstanceOf(Date);
    });

    it('never sends the same row twice across overlapping drains', async () => {
      const calls: string[] = [];
      let release!: () => void;
      const gate = new Promise<void>((r) => (release = r));
      const service = createOutbox({
        handlers: {
          test: async (_p, { rowId }) => {
            calls.push(rowId);
            await gate;
            return 'delivered';
          },
        },
      });
      await enqueueRow('overlap');

      const first = service.drain({ limit: 5 });
      // second drain starts while the first holds the lease
      await new Promise((r) => setTimeout(r, 200));
      const second = await service.drain({ limit: 5 });
      release();
      const firstResult = await first;

      expect(second.claimed).toBe(0);
      expect(firstResult.delivered).toBe(1);
      expect(calls).toEqual(['overlap']);
    });

    it('reclaims an expired lease, and the stale owner cannot overwrite the new outcome', async () => {
      await enqueueRow('stale');
      let release!: () => void;
      const gate = new Promise<void>((r) => (release = r));
      const outcomes: string[] = [];
      const slow = createOutbox({
        handlers: {
          test: async () => {
            outcomes.push('slow-started');
            await gate;
            return 'delivered';
          },
        },
      });
      const fast = createOutbox({
        handlers: {
          test: async () => {
            outcomes.push('fast');
            throw new Error('fast failed');
          },
        },
      });

      const slowDrain = slow.drain({ limit: 1 });
      await new Promise((r) => setTimeout(r, 200));
      await testDb.db
        .update(outbox)
        .set({ leaseUntil: sql`now() - interval '1 second'` })
        .where(eq(outbox.id, 'stale'));

      const reclaimed = await fast.drain({ limit: 1 });
      expect(reclaimed.claimed).toBe(1);
      expect((await rowOf('stale')).attempts).toBe(2);

      release();
      const slowResult = await slowDrain;
      expect(slowResult.leaseLost).toBe(1);
      expect(slowResult.delivered).toBe(0);
      // the reclaiming drain's failure outcome stands
      expect(await rowOf('stale')).toMatchObject({ status: 'pending', lastError: 'fast failed' });
    });

    it('retries with 30s x 2^n backoff capped at 1h, then exhausts after 8 attempts and keeps the row', async () => {
      expect([1, 2, 3, 4, 5, 6, 7].map(backoffSeconds)).toEqual([30, 60, 120, 240, 480, 960, 1920]);
      expect(backoffSeconds(8)).toBe(3600);
      expect(backoffSeconds(20)).toBe(3600);

      const service = createOutbox({
        handlers: {
          test: async () => {
            throw new Error('always fails');
          },
        },
      });
      await enqueueRow('doomed');

      for (let attempt = 1; attempt <= 7; attempt++) {
        const result = await service.drain({ limit: 1 });
        expect(result).toMatchObject({ claimed: 1, retried: 1 });
        const row = await rowOf('doomed');
        expect(row.status).toBe('pending');
        expect(row.attempts).toBe(attempt);
        const [{ delay }] = await testDb.sql<{ delay: number }[]>`
          select extract(epoch from (next_attempt_at - now()))::float as delay
          from system.outbox where id = 'doomed'`;
        expect(delay).toBeGreaterThan(backoffSeconds(attempt) - 5);
        expect(delay).toBeLessThanOrEqual(backoffSeconds(attempt));
        // not due yet: a drain right now must skip it
        expect((await service.drain({ limit: 1 })).claimed).toBe(0);
        await makeDue('doomed');
      }

      const last = await service.drain({ limit: 1 });
      expect(last).toMatchObject({ claimed: 1, exhausted: 1 });
      expect(await rowOf('doomed')).toMatchObject({
        status: 'exhausted',
        attempts: 8,
        lastError: 'always fails',
      });
      await makeDue('doomed');
      expect((await service.drain({ limit: 1 })).claimed).toBe(0);
    });

    it('marks a row expired, and never sends it, when its handler reports the request expired', async () => {
      let sends = 0;
      const service = createOutbox({
        handlers: {
          'secret-bearing': async () => {
            return 'expired';
          },
          test: async () => {
            sends++;
            return 'delivered';
          },
        },
      });
      await enqueueRow('guest-access:1', 'secret-bearing');

      const result = await service.drain({ limit: 1 });

      expect(result).toMatchObject({ claimed: 1, expired: 1, delivered: 0 });
      expect(sends).toBe(0);
      expect((await rowOf('guest-access:1')).status).toBe('expired');
    });

    it('fails a row with no handler for its kind instead of dropping it', async () => {
      const service = createOutbox({});
      await enqueueRow('mystery', 'unknown-kind');
      await service.drain({ limit: 1 });
      expect(await rowOf('mystery')).toMatchObject({
        status: 'pending',
        lastError: 'No outbox handler for kind "unknown-kind"',
      });
    });
  });

  describe('sweep', () => {
    it('reports counts per status and purges old delivered rows and idempotency rows, keeping exhausted ones', async () => {
      const service = createOutbox({ handlers: { test: async () => 'delivered' } });
      await enqueueRow('old-delivered');
      await enqueueRow('fresh-delivered');
      await enqueueRow('stuck');
      await service.drain({ limit: 10 });
      await testDb.db
        .update(outbox)
        .set({ deliveredAt: sql`now() - interval '31 days'` })
        .where(eq(outbox.id, 'old-delivered'));
      await testDb.db
        .update(outbox)
        .set({ status: 'exhausted', deliveredAt: null })
        .where(eq(outbox.id, 'stuck'));
      await testDb.db.insert(checkoutIdempotency).values([
        {
          scope: 'sweep-old',
          key: 'k',
          fingerprint: 'f',
          createdAt: sql`now() - interval '25 hours'` as never,
        },
        { scope: 'sweep-new', key: 'k', fingerprint: 'f' },
      ]);
      await enqueueRow('pending-one');
      await makeDue('pending-one');
      await testDb.db
        .update(outbox)
        .set({ nextAttemptAt: sql`now() + interval '1 hour'` })
        .where(eq(outbox.id, 'pending-one'));

      const result = await service.sweep({ limit: 10 });

      expect(result.purged).toEqual({ delivered: 1, idempotency: 1 });
      expect(result.counts).toEqual({
        pending: 1,
        processing: 0,
        delivered: 1,
        exhausted: 1,
        expired: 0,
      });
      expect(await rowOf('stuck')).toBeDefined();
      expect(await rowOf('old-delivered')).toBeUndefined();
    });

    it('rejects unauthenticated sweeper calls', () => {
      expect(isAuthorizedSweeper(null, 'secret-secret-secret')).toBe(false);
      expect(isAuthorizedSweeper('Bearer wrong-wrong-wrong-x', 'secret-secret-secret')).toBe(false);
      expect(isAuthorizedSweeper('secret-secret-secret', 'secret-secret-secret')).toBe(false);
      expect(isAuthorizedSweeper('Bearer secret-secret-secret', undefined)).toBe(false);
      expect(isAuthorizedSweeper('Bearer ', '')).toBe(false);
      expect(isAuthorizedSweeper('Bearer secret-secret-secret', 'secret-secret-secret')).toBe(true);
    });
  });

  describe('order confirmation email', () => {
    async function createVariantWithStock() {
      sequence += 1;
      const [category] = await testDb.db
        .insert(categories)
        .values({ slug: `ob-cat-${sequence}` })
        .returning();
      const [product] = await testDb.db
        .insert(products)
        .values({
          localizedName: { en: `Pen ${sequence}`, ar: `قلم ${sequence}` },
          localizedDescription: { en: 'A pen' },
          localizedLongDescription: { en: 'A very nice pen' },
          categoryId: category.id,
        })
        .returning();
      const [variant] = await testDb.db
        .insert(productVariants)
        .values({
          productId: product.id,
          variantKey: 'default',
          sku: `OB-SKU-${sequence}`,
          basePrice: '12.00',
          localizedLabel: { en: 'Blue' },
        })
        .returning();
      const [warehouse] = await testDb.db
        .insert(warehouses)
        .values({ code: `ob-wh-${sequence}`, name: 'Cairo' })
        .returning();
      await testDb.db
        .insert(inventoryBalances)
        .values({ variantId: variant.id, warehouseId: warehouse.id, onHand: 10, reserved: 0 });
      return variant.id;
    }

    const address = {
      fullName: 'Ahmed Hassan',
      phone: '01012345678',
      city: 'Cairo',
      area: 'Nasr City',
      street: 'Abbas El Akkad',
      building: '15',
      floor: '4',
      apartment: '402',
    };

    it('delivers a confirmation carrying the Order Reference after accepting an order, retrying through a provider failure', async () => {
      const variantId = await createVariantWithStock();
      const checkout = createCheckoutService({ shippingFee: 50 });
      const quote = await checkout.validate({
        source: 'cart',
        lines: [{ variantId, quantity: 2 }],
      });
      if (!quote.success) throw new Error('quote failed');

      const accepted = await checkout.accept(
        {
          source: 'cart',
          lines: [{ variantId, quantity: 2 }],
          confirmation: quote.data.confirmation,
          address,
          paymentMethod: 'cod',
          deliveryMethod: 'standard',
          guestEmail: 'Customer@Example.com',
        } as never,
        { idempotencyKey: `ob-${sequence}-${Date.now()}`, guestId: 'g1' },
      );
      if (!accepted.success) throw new Error(JSON.stringify(accepted.error));
      const reference = accepted.data.order.orderReference;

      // the row exists, holding ids only
      const row = await rowOf(`order-accepted:${reference}`);
      expect(row).toMatchObject({ kind: 'order-accepted', status: 'pending' });
      expect(Object.keys(row.payload)).toEqual(['orderId']);

      const provider = new FakeEmailProvider();
      provider.failures = 1;
      const service = createOutbox({ emailProvider: provider });

      await service.drain({ limit: 5 });
      expect(provider.sent).toHaveLength(0);
      expect((await rowOf(row.id)).status).toBe('pending');

      await makeDue(row.id);
      await service.drain({ limit: 5 });

      expect(provider.sent).toHaveLength(1);
      expect(provider.sent[0]).toMatchObject({
        to: 'customer@example.com',
        idempotencyKey: row.id,
      });
      expect(provider.sent[0].subject).toContain(reference);
      expect((await rowOf(row.id)).status).toBe('delivered');
    });

    it('does not enqueue a confirmation when acceptance rolls back', async () => {
      const variantId = await createVariantWithStock();
      const before = await testDb.db.select().from(outbox);
      const checkout = createCheckoutService({ shippingFee: 50 });

      const rejected = await checkout.accept(
        {
          source: 'cart',
          lines: [{ variantId, quantity: 2 }],
          confirmation: 'f'.repeat(64),
          address,
          paymentMethod: 'cod',
          deliveryMethod: 'standard',
          guestEmail: 'a@b.com',
        } as never,
        { idempotencyKey: `ob-rollback-${Date.now()}`, guestId: 'g2' },
      );

      expect(rejected.success).toBe(false);
      expect(await testDb.db.select().from(outbox)).toHaveLength(before.length);
    });
  });
});
