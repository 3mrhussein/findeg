import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  businessPartners,
  orderItems,
  orders,
  rewardEntitlements,
  rewardEvents,
  rewardRates,
  rewardSettlements,
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

describe('settlements, voids and debt forgiveness lines', () => {
  let testDb: TestDatabase;
  let services: PartnerRewardsServices;
  let sequence = 0;
  let settler: RewardsStaffActor;
  let adjuster: RewardsStaffActor;

  beforeAll(async () => {
    testDb = connectToTestDatabase();
    services = createPartnerRewardsServices({ db: testDb.db });
    const [staff] = await testDb.db
      .insert(users)
      .values({ email: 'reward-settler@findeg.test', portalRole: 'staff' })
      .returning();
    settler = { userId: staff.id, permissionCodes: ['rewards.settle', 'rewards.view'] };
    adjuster = { userId: staff.id, permissionCodes: ['rewards.adjust', 'rewards.view'] };
  });
  afterAll(async () => testDb.close());

  async function createPartner(fundEgp?: string) {
    sequence += 1;
    const [partner] = await testDb.db
      .insert(businessPartners)
      .values({ code: `settle-school-${sequence}`, nameEn: 'Settle School', nameAr: 'مدرسة' })
      .returning();
    if (fundEgp) {
      await services.adjustments.adjust(adjuster, partner.id, {
        amountEgp: fundEgp,
        reason: 'opening balance',
        idempotencyKey: 'fund',
      });
    }
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
        orderReference: `FE-S${String(sequence).padStart(5, '0')}`,
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

  async function earn(orderId: number) {
    await transitionOrderStatus(orderId, { status: 'delivered' });
    await transitionPaymentStatus(orderId, 'paid');
  }

  async function available(partnerId: number) {
    const result = await services.statement.getAvailableBalance(settler, partnerId);
    if (!result.success) throw new Error(`expected success, got ${result.error}`);
    return result.data.egpPiasters;
  }

  const settlement = (overrides: Record<string, unknown> = {}) => ({
    amountEgp: '40.00',
    transferReference: 'TRX-001',
    paidAt: '2026-10-01',
    notes: 'October payout',
    idempotencyKey: `settle-${(sequence += 1)}`,
    ...overrides,
  });

  async function settle(partnerId: number, overrides: Record<string, unknown> = {}) {
    const result = await services.settlements.settle(settler, partnerId, settlement(overrides));
    if (!result.success) throw new Error(`expected success, got ${result.error}`);
    return result.data;
  }

  it('lets only rewards.settle record, void or forgive', async () => {
    const partnerId = await createPartner('100.00');
    const adjustOnly: RewardsStaffActor = {
      userId: settler.userId,
      permissionCodes: ['rewards.adjust'],
    };
    const viewOnly: RewardsStaffActor = {
      userId: settler.userId,
      permissionCodes: ['rewards.view'],
    };
    const recorded = await settle(partnerId);

    for (const actor of [adjustOnly, viewOnly]) {
      await expect(services.settlements.settle(actor, partnerId, settlement())).resolves.toEqual({
        success: false,
        error: 'forbidden',
      });
      await expect(
        services.settlements.void(actor, partnerId, recorded.id, { reason: 'mistake' }),
      ).resolves.toEqual({ success: false, error: 'forbidden' });
      await expect(
        services.settlements.forgiveDebt(actor, partnerId, {
          amountEgp: '1.00',
          reason: 'debt',
          idempotencyKey: 'wo-forbidden',
        }),
      ).resolves.toEqual({ success: false, error: 'forbidden' });
    }
    expect(await available(partnerId)).toBe(6_000n);
  });

  it('subtracts a settlement from the Available Balance', async () => {
    const partnerId = await createPartner('100.00');
    const recorded = await settle(partnerId, { amountEgp: '40.25' });
    expect(recorded).toMatchObject({
      businessPartnerId: partnerId,
      kind: 'settlement',
      amountPiasters: 4_025n,
      transferReference: 'TRX-001',
      paidAt: '2026-10-01',
      replayed: false,
    });
    expect(await available(partnerId)).toBe(5_975n);
  });

  it('requires an amount of at least 0.01 EGP, a transfer reference, a paid-at date and a key', async () => {
    const partnerId = await createPartner('100.00');
    const settledSoFar = [
      { amountEgp: '0.00' },
      { amountEgp: '-5.00' },
      { amountEgp: '1.005' },
      { amountEgp: 'abc' },
      { amountEgp: 5 },
      { transferReference: '  ' },
      { transferReference: undefined },
      { paidAt: '2026-02-30' },
      { paidAt: 'yesterday' },
      { paidAt: undefined },
      { idempotencyKey: '' },
      { idempotencyKey: undefined },
      { notes: 'x'.repeat(2_001) },
    ];
    for (const overrides of settledSoFar) {
      await expect(
        services.settlements.settle(settler, partnerId, settlement(overrides)),
      ).resolves.toEqual({ success: false, error: 'invalid-input' });
    }
    expect(await available(partnerId)).toBe(10_000n);

    await expect(
      services.settlements.settle(
        settler,
        partnerId,
        settlement({ amountEgp: '0.01', notes: undefined }),
      ),
    ).resolves.toMatchObject({ success: true });
    await expect(services.settlements.settle(settler, 999_999_999, settlement())).resolves.toEqual({
      success: false,
      error: 'not-found',
    });
  });

  it('rejects a settlement over the Available Balance and allows the exact balance', async () => {
    const partnerId = await createPartner('100.00');
    await acceptOrder(partnerId, 9_999n); // pending: never counts toward available

    await expect(
      services.settlements.settle(settler, partnerId, settlement({ amountEgp: '100.01' })),
    ).resolves.toEqual({ success: false, error: 'exceeds-available' });
    expect(await available(partnerId)).toBe(10_000n);

    await settle(partnerId, { amountEgp: '100.00' });
    expect(await available(partnerId)).toBe(0n);
    await expect(
      services.settlements.settle(settler, partnerId, settlement({ amountEgp: '0.01' })),
    ).resolves.toEqual({ success: false, error: 'exceeds-available' });
  });

  it('cannot overspend the balance with concurrent settlements', async () => {
    const partnerId = await createPartner('100.00');
    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        services.settlements.settle(settler, partnerId, settlement({ amountEgp: '60.00' })),
      ),
    );
    expect(results.filter((r) => r.success)).toHaveLength(1);
    expect(
      results.filter((r) => !r.success).every((r) => !r.success && r.error === 'exceeds-available'),
    ).toBe(true);
    expect(await available(partnerId)).toBe(4_000n);
  });

  it('replays the same key and payload and conflicts on a different one', async () => {
    const partnerId = await createPartner('100.00');
    const input = settlement({ idempotencyKey: 'k-replay' });

    const first = await services.settlements.settle(settler, partnerId, input);
    const replay = await services.settlements.settle(settler, partnerId, input);
    expect(first).toMatchObject({ success: true, data: { replayed: false } });
    expect(replay).toMatchObject({ success: true, data: { replayed: true } });
    if (!first.success || !replay.success) throw new Error('expected success');
    expect(replay.data.id).toBe(first.data.id);
    expect(await available(partnerId)).toBe(6_000n);

    for (const different of [
      { amountEgp: '41.00' },
      { transferReference: 'TRX-002' },
      { paidAt: '2026-10-02' },
      { notes: 'other' },
    ]) {
      await expect(
        services.settlements.settle(settler, partnerId, { ...input, ...different }),
      ).resolves.toEqual({ success: false, error: 'idempotency-conflict' });
    }
    expect(await available(partnerId)).toBe(6_000n);

    // A replay still succeeds after the balance can no longer cover it, and keys are per partner.
    await settle(partnerId, { amountEgp: '60.00' });
    await expect(services.settlements.settle(settler, partnerId, input)).resolves.toMatchObject({
      success: true,
      data: { replayed: true },
    });
    const otherPartnerId = await createPartner('100.00');
    await expect(
      services.settlements.settle(settler, otherPartnerId, input),
    ).resolves.toMatchObject({ success: true, data: { replayed: false } });
  });

  it('applies concurrent retries of one key exactly once', async () => {
    const partnerId = await createPartner('100.00');
    const input = settlement({ idempotencyKey: 'k-race' });
    const results = await Promise.all(
      Array.from({ length: 5 }, () => services.settlements.settle(settler, partnerId, input)),
    );
    expect(results.every((r) => r.success)).toBe(true);
    expect(await available(partnerId)).toBe(6_000n);
  });

  it('voids a settlement once with a required reason, restoring the balance', async () => {
    const partnerId = await createPartner('100.00');
    const recorded = await settle(partnerId, { amountEgp: '40.00' });

    for (const input of [{}, { reason: '  ' }, { reason: 5 }]) {
      await expect(
        services.settlements.void(settler, partnerId, recorded.id, input),
      ).resolves.toEqual({ success: false, error: 'invalid-input' });
    }
    expect(await available(partnerId)).toBe(6_000n);

    const voided = await services.settlements.void(settler, partnerId, recorded.id, {
      reason: 'wrong transfer',
    });
    expect(voided).toMatchObject({
      success: true,
      data: {
        kind: 'void',
        voidsSettlementId: recorded.id,
        amountPiasters: -4_000n,
        reason: 'wrong transfer',
      },
    });
    expect(await available(partnerId)).toBe(10_000n);

    await expect(
      services.settlements.void(settler, partnerId, recorded.id, { reason: 'again' }),
    ).resolves.toEqual({ success: false, error: 'already-voided' });
    expect(await available(partnerId)).toBe(10_000n);
  });

  it('cannot void a void, a debt forgiveness, another partner’s settlement or a missing one', async () => {
    const partnerId = await createPartner('100.00');
    const recorded = await settle(partnerId);
    const voided = await services.settlements.void(settler, partnerId, recorded.id, {
      reason: 'mistake',
    });
    if (!voided.success) throw new Error('expected success');

    await expect(
      services.settlements.void(settler, partnerId, voided.data.id, { reason: 'undo' }),
    ).resolves.toEqual({ success: false, error: 'not-voidable' });

    const otherPartnerId = await createPartner('100.00');
    const other = await settle(otherPartnerId);
    await expect(
      services.settlements.void(settler, partnerId, other.id, { reason: 'wrong partner' }),
    ).resolves.toEqual({ success: false, error: 'not-found' });
    await expect(
      services.settlements.void(settler, partnerId, 999_999_999, { reason: 'missing' }),
    ).resolves.toEqual({ success: false, error: 'not-found' });
    expect(await available(otherPartnerId)).toBe(6_000n);
  });

  it('applies concurrent voids of one settlement exactly once', async () => {
    const partnerId = await createPartner('100.00');
    const recorded = await settle(partnerId, { amountEgp: '40.00' });
    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        services.settlements.void(settler, partnerId, recorded.id, { reason: 'race' }),
      ),
    );
    expect(results.filter((r) => r.success)).toHaveLength(1);
    expect(await available(partnerId)).toBe(10_000n);
  });

  it('goes negative on a reversal after settlement, and later earnings offset the debt', async () => {
    const partnerId = await createPartner();
    const reversedOrderId = await acceptOrder(partnerId, 5_000n);
    await earn(reversedOrderId);
    await settle(partnerId, { amountEgp: '50.00' });
    expect(await available(partnerId)).toBe(0n);

    await transitionPaymentStatus(reversedOrderId, 'refunded');
    expect(await available(partnerId)).toBe(-5_000n);
    await expect(
      services.settlements.settle(settler, partnerId, settlement({ amountEgp: '0.01' })),
    ).resolves.toEqual({ success: false, error: 'exceeds-available' });

    await earn(await acceptOrder(partnerId, 2_000n));
    expect(await available(partnerId)).toBe(-3_000n);
    await earn(await acceptOrder(partnerId, 4_000n));
    expect(await available(partnerId)).toBe(1_000n);
  });

  it('writes off a negative balance as its own line type with a required reason', async () => {
    const partnerId = await createPartner('-30.00');
    const input = { amountEgp: '30.00', reason: 'uncollectable', idempotencyKey: 'wo-1' };

    for (const bad of [
      { reason: ' ' },
      { reason: undefined },
      { idempotencyKey: '' },
      { amountEgp: '0.00' },
      { amountEgp: '-1.00' },
    ]) {
      await expect(
        services.settlements.forgiveDebt(settler, partnerId, { ...input, ...bad }),
      ).resolves.toEqual({ success: false, error: 'invalid-input' });
    }
    await expect(
      services.settlements.forgiveDebt(settler, partnerId, { ...input, amountEgp: '30.01' }),
    ).resolves.toEqual({ success: false, error: 'exceeds-debt' });
    expect(await available(partnerId)).toBe(-3_000n);

    const written = await services.settlements.forgiveDebt(settler, partnerId, input);
    expect(written).toMatchObject({
      success: true,
      data: {
        kind: 'debt-forgiveness',
        amountPiasters: 3_000n,
        reason: 'uncollectable',
        replayed: false,
      },
    });
    expect(await available(partnerId)).toBe(0n);

    // Replay returns the original; a settled balance has no debt left to forgive.
    await expect(
      services.settlements.forgiveDebt(settler, partnerId, input),
    ).resolves.toMatchObject({
      success: true,
      data: { replayed: true },
    });
    await expect(
      services.settlements.forgiveDebt(settler, partnerId, { ...input, idempotencyKey: 'wo-2' }),
    ).resolves.toEqual({ success: false, error: 'exceeds-debt' });
    await expect(
      services.settlements.forgiveDebt(settler, partnerId, { ...input, amountEgp: '5.00' }),
    ).resolves.toEqual({ success: false, error: 'idempotency-conflict' });
  });

  it('forgives only part of a debt, leaving the balance negative, then the rest', async () => {
    const partnerId = await createPartner('-30.00');
    const forgive = (amountEgp: string, idempotencyKey: string) =>
      services.settlements.forgiveDebt(settler, partnerId, {
        amountEgp,
        reason: 'partial relief',
        idempotencyKey,
      });

    await expect(forgive('10.00', 'df-part-1')).resolves.toMatchObject({ success: true });
    expect(await available(partnerId)).toBe(-2_000n);
    await expect(forgive('20.01', 'df-part-2')).resolves.toEqual({
      success: false,
      error: 'exceeds-debt',
    });
    await expect(forgive('20.00', 'df-part-3')).resolves.toMatchObject({ success: true });
    expect(await available(partnerId)).toBe(0n);
  });

  it('lists a Business Partner’s settlement lines newest first for rewards.view', async () => {
    const partnerId = await createPartner('100.00');
    const recorded = await settle(partnerId, { amountEgp: '10.00' });
    await services.settlements.void(settler, partnerId, recorded.id, { reason: 'oops' });

    const listed = await services.settlements.list(settler, partnerId);
    expect(listed).toMatchObject({
      success: true,
      data: [
        { kind: 'void', voidsSettlementId: recorded.id, amountPiasters: -1_000n },
        { kind: 'settlement', id: recorded.id, amountPiasters: 1_000n },
      ],
    });
    await expect(
      services.settlements.list({ userId: settler.userId, permissionCodes: [] }, partnerId),
    ).resolves.toEqual({ success: false, error: 'forbidden' });
  });

  it('cannot update or delete a settlement line', async () => {
    const partnerId = await createPartner('100.00');
    await settle(partnerId);
    const refused = { cause: { message: expect.stringMatching(/append-only/i) } };

    await expect(
      testDb.db
        .update(rewardSettlements)
        .set({ amountPiasters: 1n })
        .where(eq(rewardSettlements.businessPartnerId, partnerId)),
    ).rejects.toMatchObject(refused);
    await expect(
      testDb.db.delete(rewardSettlements).where(eq(rewardSettlements.businessPartnerId, partnerId)),
    ).rejects.toMatchObject(refused);
  });

  it('refuses a void of a non-settlement line at the database', async () => {
    const partnerId = await createPartner('100.00');
    const recorded = await settle(partnerId);
    const [voidRow] = await testDb.db
      .insert(rewardSettlements)
      .values({
        businessPartnerId: partnerId,
        kind: 'void',
        voidsSettlementId: recorded.id,
        amountPiasters: -recorded.amountPiasters,
        reason: 'direct',
      })
      .returning();

    await expect(
      testDb.db.insert(rewardSettlements).values({
        businessPartnerId: partnerId,
        kind: 'void',
        voidsSettlementId: voidRow.id,
        amountPiasters: voidRow.amountPiasters,
        reason: 'void of a void',
      }),
    ).rejects.toThrow();
    await expect(
      testDb.db.insert(rewardSettlements).values({
        businessPartnerId: partnerId,
        kind: 'void',
        voidsSettlementId: recorded.id,
        amountPiasters: -recorded.amountPiasters,
        reason: 'second void',
      }),
    ).rejects.toThrow();
  });
});
