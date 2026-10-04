import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  businessPartners,
  orderItems,
  orders,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
} from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { transitionOrderStatus } from '../../order/application/services/transition-order-status';
import { transitionPaymentStatus } from '../../order/application/services/transition-payment-status';
import { createPartnerRewardsServices, type PartnerRewardsServices } from '..';

const staff = { userId: 1, activeRoleIds: ['system_admin'] };

describe('cancellation and refund', () => {
  let testDb: TestDatabase;
  let services: PartnerRewardsServices;
  let sequence = 0;

  beforeAll(() => {
    testDb = connectToTestDatabase();
    services = createPartnerRewardsServices({ db: testDb.db });
  });
  afterAll(async () => testDb.close());

  /** One accepted Order with a single 100-point line for its own Business Partner. */
  async function createOrder(status: 'processing' | 'shipped' = 'shipped') {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: `refund-school-${sequence}`, nameEn: 'Refund School', nameAr: 'مدرسة' })
      .returning();
    const [rate] = await testDb.db
      .insert(rewardRates)
      .values({ businessPartnerId: partner.id, pointsPerEgp: '1.000000', egpPerPoint: '0.0100' })
      .returning();
    const [order] = await testDb.db
      .insert(orders)
      .values({
        orderReference: `FE-R${String(sequence).padStart(5, '0')}`,
        totalAmount: '100.00',
        status,
      })
      .returning();
    const [item] = await testDb.db
      .insert(orderItems)
      .values({ orderId: order.id, quantity: 1, lineTotal: '100.00' })
      .returning();
    const [entitlement] = await testDb.db
      .insert(rewardEntitlements)
      .values({
        businessPartnerId: partner.id,
        orderItemId: item.id,
        rewardRateId: rate.id,
        chargedLineTotalPiasters: 10_000n,
        points: 100n,
        egpValuePiasters: 100n,
      })
      .returning();
    await testDb.db.insert(rewardEvents).values({
      businessPartnerId: partner.id,
      entitlementId: entitlement.id,
      eventType: 'accepted',
      points: 100n,
      egpValuePiasters: 100n,
    });
    return { orderId: order.id, partnerId: partner.id, entitlementId: entitlement.id };
  }

  async function earnedOrder() {
    const created = await createOrder();
    await transitionOrderStatus(created.orderId, { status: 'delivered' });
    await transitionPaymentStatus(created.orderId, 'paid');
    return created;
  }

  async function closingEvents(entitlementId: number) {
    return testDb.db
      .select({ eventType: rewardEvents.eventType })
      .from(rewardEvents)
      .where(
        and(
          eq(rewardEvents.entitlementId, entitlementId),
          inArray(rewardEvents.eventType, ['cancellation', 'reversal']),
        ),
      );
  }

  async function orderState(orderId: number) {
    const [order] = await testDb.db
      .select({ status: orders.status, paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.id, orderId));
    return order;
  }

  async function statement(partnerId: number) {
    const [pending, earned, reversed] = await Promise.all([
      services.rates.getPending(staff, partnerId),
      services.rates.getEarned(staff, partnerId),
      services.rates.getReversed(staff, partnerId),
    ]);
    if (!pending.success || !earned.success || !reversed.success) {
      throw new Error('expected success');
    }
    return {
      pending: pending.data.points,
      earned: earned.data.points,
      reversed: reversed.data.points,
    };
  }

  it('voids pending points when an Order is cancelled before earning', async () => {
    const { orderId, partnerId } = await createOrder('processing');
    expect(await statement(partnerId)).toEqual({ pending: 100n, earned: 0n, reversed: 0n });

    await transitionOrderStatus(orderId, { status: 'cancelled' });
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 0n, reversed: 0n });
  });

  it('voids pending points when an Order is refunded before earning', async () => {
    const { orderId, partnerId } = await createOrder();
    await transitionOrderStatus(orderId, { status: 'refunded' });
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 0n, reversed: 0n });
  });

  it('voids pending points when payment is refunded before earning', async () => {
    const { orderId, partnerId } = await createOrder();
    await transitionPaymentStatus(orderId, 'paid');
    await transitionPaymentStatus(orderId, 'refunded');
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 0n, reversed: 0n });
  });

  it('reverses earned points when payment is refunded after earning', async () => {
    const { orderId, partnerId } = await createOrder();
    await transitionOrderStatus(orderId, { status: 'delivered' });
    await transitionPaymentStatus(orderId, 'paid');
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 100n, reversed: 0n });

    await transitionPaymentStatus(orderId, 'refunded');
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 100n, reversed: 100n });
  });

  it('reverses earned points when the Order is refunded while payment is still paid', async () => {
    const { orderId, partnerId, entitlementId } = await earnedOrder();
    await transitionOrderStatus(orderId, { status: 'refunded' });

    expect(await orderState(orderId)).toEqual({ status: 'refunded', paymentStatus: 'paid' });
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 100n, reversed: 100n });
    expect(await closingEvents(entitlementId)).toEqual([{ eventType: 'reversal' }]);
  });

  it('voids pending points when the Order is refunded while paid but not delivered', async () => {
    const { orderId, partnerId, entitlementId } = await createOrder();
    await transitionPaymentStatus(orderId, 'paid');
    await transitionOrderStatus(orderId, { status: 'refunded' });

    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 0n, reversed: 0n });
    expect(await closingEvents(entitlementId)).toEqual([{ eventType: 'cancellation' }]);
  });

  it('makes a payment refund after an Order refund a no-op', async () => {
    const { orderId, partnerId, entitlementId } = await earnedOrder();
    await transitionOrderStatus(orderId, { status: 'refunded' });
    expect(await transitionPaymentStatus(orderId, 'refunded')).toMatchObject({ changed: true });

    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 100n, reversed: 100n });
    expect(await closingEvents(entitlementId)).toEqual([{ eventType: 'reversal' }]);
  });

  it('makes an Order refund after a payment refund a no-op', async () => {
    const { orderId, partnerId, entitlementId } = await earnedOrder();
    await transitionPaymentStatus(orderId, 'refunded');
    expect(await transitionOrderStatus(orderId, { status: 'refunded' })).toMatchObject({
      changed: true,
    });

    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 100n, reversed: 100n });
    expect(await closingEvents(entitlementId)).toEqual([{ eventType: 'reversal' }]);
  });

  it('reverses once when the Order and payment are refunded concurrently', async () => {
    const { orderId, partnerId, entitlementId } = await earnedOrder();
    await Promise.all([
      transitionOrderStatus(orderId, { status: 'refunded' }),
      transitionPaymentStatus(orderId, 'refunded'),
    ]);

    expect(await orderState(orderId)).toEqual({ status: 'refunded', paymentStatus: 'refunded' });
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 100n, reversed: 100n });
    expect(await closingEvents(entitlementId)).toEqual([{ eventType: 'reversal' }]);
  });

  it('rolls back the payment refund and its reversal together', async () => {
    const { orderId, partnerId } = await earnedOrder();

    // No such user, so the audit row's admin_user_id foreign key rejects the insert.
    await expect(
      transitionPaymentStatus(orderId, 'refunded', { userId: 2_147_483_647 }),
    ).rejects.toThrow();

    expect(await orderState(orderId)).toEqual({ status: 'delivered', paymentStatus: 'paid' });
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 100n, reversed: 0n });
  });

  it('rolls back the Order refund when its reversal cannot commit', async () => {
    const { orderId, partnerId } = await earnedOrder();
    // A deferred trigger fails the transaction at commit, after the status and ledger writes.
    await testDb.db.execute(
      sql.raw(`
      create function rewards.test_reject_reversal() returns trigger language plpgsql as $$
      begin
        raise exception 'reversal rejected for test';
      end $$;
      create constraint trigger test_reject_reversal after insert on rewards.reward_events
        deferrable initially deferred for each row
        when (new.event_type = 'reversal' and new.business_partner_id = ${partnerId})
        execute function rewards.test_reject_reversal();
    `),
    );
    try {
      await expect(transitionOrderStatus(orderId, { status: 'refunded' })).rejects.toThrow();
    } finally {
      await testDb.db.execute(
        sql.raw(`
        drop trigger test_reject_reversal on rewards.reward_events;
        drop function rewards.test_reject_reversal();
      `),
      );
    }

    expect(await orderState(orderId)).toEqual({ status: 'delivered', paymentStatus: 'paid' });
    expect(await statement(partnerId)).toEqual({ pending: 0n, earned: 100n, reversed: 0n });
  });
});
