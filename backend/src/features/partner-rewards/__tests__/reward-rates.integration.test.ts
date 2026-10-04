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
import {
  createPartnerRewardsServices,
  type PartnerRewardsServices,
  type RewardsStaffActor,
} from '..';

describe('Reward Rates and immutable ledger foundation', () => {
  let testDb: TestDatabase;
  let services: PartnerRewardsServices;
  let partnerId: number;
  let actor: RewardsStaffActor;
  let viewer: RewardsStaffActor;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerRewardsServices({ db: testDb.db });
    const [manager, readOnly] = await testDb.db
      .insert(users)
      .values([
        { email: 'reward-rate-manager@findeg.test', portalRole: 'staff' },
        { email: 'reward-rate-viewer@findeg.test', portalRole: 'staff' },
      ])
      .returning();
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: 'reward-rate-school', nameEn: 'Reward School', nameAr: 'مدرسة المكافآت' })
      .returning();

    partnerId = partner.id;
    actor = {
      userId: manager.id,
      permissionCodes: ['rewards.view', 'rewards.rates.manage'],
    };
    viewer = { userId: readOnly.id, permissionCodes: ['rewards.view'] };
  });

  afterAll(async () => testDb.close());

  it('allows only rewards.rates.manage to append a valid Reward Rate', async () => {
    await expect(
      services.rates.setRate(viewer, partnerId, {
        pointsPerEgp: '1.25',
        egpPerPoint: '0.0125',
      }),
    ).resolves.toEqual({ success: false, error: 'forbidden' });

    await expect(
      services.rates.setRate(actor, partnerId, {
        pointsPerEgp: '1000000',
        egpPerPoint: '0.0125',
      }),
    ).resolves.toEqual({ success: false, error: 'invalid-input' });

    await expect(
      services.rates.setRate(actor, partnerId, {
        pointsPerEgp: '1.25',
        egpPerPoint: '0.0125',
      }),
    ).resolves.toMatchObject({
      success: true,
      data: { businessPartnerId: partnerId, pointsPerEgp: '1.250000', egpPerPoint: '0.0125' },
    });
  });

  it('keeps history and treats the newest appended rate as current', async () => {
    const appended = await services.rates.setRate(actor, partnerId, {
      pointsPerEgp: '2',
      egpPerPoint: '0.02',
    });
    expect(appended).toMatchObject({ success: true });

    const result = await services.rates.getRates(viewer, partnerId);
    expect(result).toMatchObject({
      success: true,
      data: {
        current: { pointsPerEgp: '2.000000', egpPerPoint: '0.0200' },
        history: [
          { pointsPerEgp: '2.000000', egpPerPoint: '0.0200' },
          { pointsPerEgp: '1.250000', egpPerPoint: '0.0125' },
        ],
      },
    });
  });

  it('refuses UPDATE and DELETE on rates, entitlements, and events', async () => {
    const expectAppendOnly = (operation: Promise<unknown>) =>
      expect(operation).rejects.toMatchObject({
        cause: { message: expect.stringMatching(/append-only/i) },
      });
    const [rate] = await testDb.db
      .select()
      .from(rewardRates)
      .where(eq(rewardRates.businessPartnerId, partnerId))
      .limit(1);
    const [order] = await testDb.db
      .insert(orders)
      .values({ orderReference: 'FE-RWRD01', totalAmount: '10.00' })
      .returning();
    const [item] = await testDb.db
      .insert(orderItems)
      .values({ orderId: order.id, quantity: 1, lineTotal: '10.00' })
      .returning();
    const [entitlement] = await testDb.db
      .insert(rewardEntitlements)
      .values({
        businessPartnerId: partnerId,
        orderItemId: item.id,
        rewardRateId: rate.id,
        chargedLineTotalPiasters: 1_000n,
        points: 12n,
        egpValuePiasters: 15n,
      })
      .returning();
    const [event] = await testDb.db
      .insert(rewardEvents)
      .values({
        businessPartnerId: partnerId,
        entitlementId: entitlement.id,
        eventType: 'accepted',
        points: 12n,
        egpValuePiasters: 15n,
      })
      .returning();

    await expectAppendOnly(
      testDb.db
        .update(rewardRates)
        .set({ pointsPerEgp: '3.000000' })
        .where(eq(rewardRates.id, rate.id)),
    );
    await expectAppendOnly(testDb.db.delete(rewardRates).where(eq(rewardRates.id, rate.id)));
    await expectAppendOnly(
      testDb.db
        .update(rewardEntitlements)
        .set({ points: 13n })
        .where(eq(rewardEntitlements.id, entitlement.id)),
    );
    await expectAppendOnly(
      testDb.db.delete(rewardEntitlements).where(eq(rewardEntitlements.id, entitlement.id)),
    );
    await expectAppendOnly(
      testDb.db.update(rewardEvents).set({ points: 13n }).where(eq(rewardEvents.id, event.id)),
    );
    await expectAppendOnly(testDb.db.delete(rewardEvents).where(eq(rewardEvents.id, event.id)));
  });

  it('allows only one accepted, one paid, and one reversal or cancellation per entitlement', async () => {
    const [entitlement] = await testDb.db
      .select()
      .from(rewardEntitlements)
      .where(eq(rewardEntitlements.businessPartnerId, partnerId))
      .limit(1);
    const event = (eventType: 'accepted' | 'paid' | 'reversal' | 'cancellation') => ({
      businessPartnerId: partnerId,
      entitlementId: entitlement.id,
      eventType,
      points: 12n,
      egpValuePiasters: 15n,
    });

    await expect(testDb.db.insert(rewardEvents).values(event('accepted'))).rejects.toMatchObject({
      cause: { code: '23505' },
    });
    await testDb.db.insert(rewardEvents).values(event('paid'));
    await expect(testDb.db.insert(rewardEvents).values(event('paid'))).rejects.toMatchObject({
      cause: { code: '23505' },
    });
    await testDb.db.insert(rewardEvents).values(event('reversal'));
    await expect(
      testDb.db.insert(rewardEvents).values(event('cancellation')),
    ).rejects.toMatchObject({
      cause: { code: '23505' },
    });
  });

  it('requires reasoned, per-partner-idempotent adjustments', async () => {
    const adjustment = {
      businessPartnerId: partnerId,
      eventType: 'adjustment' as const,
      points: 1n,
      egpValuePiasters: 1n,
      idempotencyKey: 'adjustment-1',
    };

    await expect(testDb.db.insert(rewardEvents).values(adjustment)).rejects.toMatchObject({
      cause: { code: '23514' },
    });
    await testDb.db.insert(rewardEvents).values({ ...adjustment, reason: 'Finance correction' });
    await expect(
      testDb.db
        .insert(rewardEvents)
        .values({ ...adjustment, reason: 'Retried Finance correction' }),
    ).rejects.toMatchObject({ cause: { code: '23505' } });
  });
});
