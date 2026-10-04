import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  businessPartners,
  orderItems,
  orders,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
  users,
} from '@findeg/db/schema';
import { eq } from 'drizzle-orm';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { transitionOrderStatus } from '../../order/application/services/transition-order-status';
import { transitionPaymentStatus } from '../../order/application/services/transition-payment-status';
import {
  createPartnerRewardsServices,
  type PartnerRewardsServices,
  type RewardsStaffActor,
} from '..';

describe('adjustments and the signed Available Balance', () => {
  let testDb: TestDatabase;
  let services: PartnerRewardsServices;
  let sequence = 0;
  let adjuster: RewardsStaffActor;
  let viewer: RewardsStaffActor;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerRewardsServices({ db: testDb.db });
    const [staff] = await testDb.db
      .insert(users)
      .values({ email: 'reward-adjuster@findeg.test', portalRole: 'staff' })
      .returning();
    adjuster = { userId: staff.id, permissionCodes: ['rewards.adjust', 'rewards.view'] };
    viewer = { userId: staff.id, permissionCodes: ['rewards.view'] };
  });
  afterAll(async () => testDb.close());

  async function createPartner() {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: `adjust-school-${sequence}`, nameEn: 'Adjust School', nameAr: 'مدرسة' })
      .returning();
    return partner.id;
  }

  /** One accepted Order whose single line is worth `egpValuePiasters` once earned. */
  async function acceptOrder(partnerId: number, egpValuePiasters: bigint) {
    sequence += 1;
    const [rate] = await testDb.db
      .insert(rewardRates)
      .values({ businessPartnerId: partnerId, pointsPerEgp: '1.000000', egpPerPoint: '0.0100' })
      .returning();
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-A${String(sequence).padStart(5, '0')}`,
        totalAmount: '100.00',
        status: 'shipped',
      })
      .returning();
    const [item] = await testDb.db
      .insert(orderItems)
      .values({ orderId: order.id, quantity: 1, lineTotal: '100.00' })
      .returning();
    const [entitlement] = await testDb.db
      .insert(rewardEntitlements)
      .values({
        businessPartnerId: partnerId,
        orderItemId: item.id,
        rewardRateId: rate.id,
        chargedLineTotalPiasters: 10_000n,
        points: 100n,
        egpValuePiasters,
      })
      .returning();
    await testDb.db.insert(rewardEvents).values({
      businessPartnerId: partnerId,
      entitlementId: entitlement.id,
      eventType: 'accepted',
      points: 100n,
      egpValuePiasters,
    });
    return order.id;
  }

  async function available(partnerId: number) {
    const result = await services.statement.getAvailableBalance(viewer, partnerId);
    if (!result.success) throw new Error(`expected success, got ${result.error}`);
    return result.data.egpPiasters;
  }

  it('lets only rewards.adjust append an adjustment', async () => {
    const partnerId = await createPartner();

    await expect(
      services.adjustments.adjust(viewer, partnerId, {
        amountEgp: '5.00',
        reason: 'goodwill',
        idempotencyKey: 'k-forbidden',
      }),
    ).resolves.toEqual({ success: false, error: 'forbidden' });
    expect(await available(partnerId)).toBe(0n);

    await expect(
      services.adjustments.adjust(adjuster, partnerId, {
        amountEgp: '5.00',
        reason: 'goodwill',
        idempotencyKey: 'k-allowed',
      }),
    ).resolves.toMatchObject({ success: true });
  });

  it('computes a signed EGP Available Balance of earned − reversed ± adjustments, excluding pending', async () => {
    const partnerId = await createPartner();
    const earnedOrderId = await acceptOrder(partnerId, 5_000n);
    const reversedOrderId = await acceptOrder(partnerId, 2_000n);
    await acceptOrder(partnerId, 9_999n); // stays pending: never counts

    for (const orderId of [earnedOrderId, reversedOrderId]) {
      await transitionOrderStatus(orderId, { status: 'delivered' });
      await transitionPaymentStatus(orderId, 'paid');
    }
    await transitionPaymentStatus(reversedOrderId, 'refunded');
    expect(await available(partnerId)).toBe(5_000n);

    await services.adjustments.adjust(adjuster, partnerId, {
      amountEgp: '12.50',
      reason: 'bonus',
      idempotencyKey: 'k-plus',
    });
    expect(await available(partnerId)).toBe(6_250n);

    await services.adjustments.adjust(adjuster, partnerId, {
      amountEgp: '-100.00',
      reason: 'correction',
      idempotencyKey: 'k-minus',
    });
    expect(await available(partnerId)).toBe(-3_750n);
  });

  it('requires a reason, a key and a non-zero EGP amount', async () => {
    const partnerId = await createPartner();
    const valid = { amountEgp: '1.00', reason: 'why', idempotencyKey: 'k-valid' };
    for (const input of [
      { ...valid, reason: '   ' },
      { ...valid, reason: undefined },
      { ...valid, idempotencyKey: '' },
      { ...valid, idempotencyKey: undefined },
      { ...valid, amountEgp: '0.00' },
      { ...valid, amountEgp: '1.005' },
      { ...valid, amountEgp: 'abc' },
      { ...valid, amountEgp: 1.5 },
    ]) {
      await expect(services.adjustments.adjust(adjuster, partnerId, input)).resolves.toEqual({
        success: false,
        error: 'invalid-input',
      });
    }
    expect(await available(partnerId)).toBe(0n);
  });

  it('replays the original for the same key and payload, and conflicts on a different payload', async () => {
    const partnerId = await createPartner();
    const input = { amountEgp: '7.00', reason: 'fix', idempotencyKey: 'k-replay' };

    const first = await services.adjustments.adjust(adjuster, partnerId, input);
    const replay = await services.adjustments.adjust(adjuster, partnerId, input);
    expect(first).toMatchObject({ success: true, data: { replayed: false } });
    expect(replay).toMatchObject({ success: true, data: { replayed: true } });
    if (!first.success || !replay.success) throw new Error('expected success');
    expect(replay.data.id).toBe(first.data.id);
    expect(await available(partnerId)).toBe(700n);

    for (const different of [{ amountEgp: '8.00' }, { reason: 'other reason' }]) {
      await expect(
        services.adjustments.adjust(adjuster, partnerId, { ...input, ...different }),
      ).resolves.toEqual({ success: false, error: 'idempotency-conflict' });
    }
    expect(await available(partnerId)).toBe(700n);

    // Keys are scoped per Business Partner.
    const otherPartnerId = await createPartner();
    await expect(
      services.adjustments.adjust(adjuster, otherPartnerId, { ...input, amountEgp: '1.00' }),
    ).resolves.toMatchObject({ success: true, data: { replayed: false } });
  });

  it('applies concurrent retries of one key exactly once', async () => {
    const partnerId = await createPartner();
    const input = { amountEgp: '3.00', reason: 'race', idempotencyKey: 'k-race' };
    const results = await Promise.all(
      Array.from({ length: 5 }, () => services.adjustments.adjust(adjuster, partnerId, input)),
    );
    expect(results.every((r: { success: boolean }) => r.success)).toBe(true);
    expect(await available(partnerId)).toBe(300n);
  });

  it('cannot update or delete an adjustment', async () => {
    const partnerId = await createPartner();
    await services.adjustments.adjust(adjuster, partnerId, {
      amountEgp: '4.00',
      reason: 'immutable',
      idempotencyKey: 'k-immutable',
    });
    const refused = { cause: { message: expect.stringMatching(/append-only/i) } };

    await expect(
      testDb.db
        .update(rewardEvents)
        .set({ egpValuePiasters: 1n })
        .where(eq(rewardEvents.businessPartnerId, partnerId)),
    ).rejects.toMatchObject(refused);
    await expect(
      testDb.db.delete(rewardEvents).where(eq(rewardEvents.businessPartnerId, partnerId)),
    ).rejects.toMatchObject(refused);
  });

  it('hides the balance from actors without rewards.view and for unknown partners', async () => {
    const partnerId = await createPartner();
    await expect(
      services.statement.getAvailableBalance({ userId: 1, permissionCodes: [] }, partnerId),
    ).resolves.toEqual({ success: false, error: 'forbidden' });
    await expect(services.statement.getAvailableBalance(viewer, 999_999_999)).resolves.toEqual({
      success: false,
      error: 'not-found',
    });
    await expect(
      services.adjustments.adjust(adjuster, 999_999_999, {
        amountEgp: '1.00',
        reason: 'x',
        idempotencyKey: 'k-missing',
      }),
    ).resolves.toEqual({ success: false, error: 'not-found' });
  });
});
