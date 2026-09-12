import { describe, expect, it } from 'vitest';
import {
  createPartnerRewards,
  summarizeRewardLedger,
  type PartnerRewardAccess,
  type PartnerRewardEvent,
} from '../public.js';

const session = {
  userId: 7,
  email: 'manager@example.test',
  emailVerified: true,
  activePortal: 'partner',
  authorizationVersion: 1,
  staffRoles: [],
  permissions: [],
  partner: {
    businessPartnerId: 12,
    membershipId: 4,
    roles: ['partner-administrator'],
    authorizationVersion: 1,
  },
} as const;

describe('Partner rewards', () => {
  it('keeps pending and earned points separate until a qualifying paid order is confirmed', () => {
    const events: PartnerRewardEvent[] = [
      {
        partnerId: 12,
        orderReference: 'ord-1',
        eventType: 'accepted',
        points: 200,
        pendingPoints: 200,
        conversionRate: 1.25,
        createdAt: new Date('2026-09-01T00:00:00Z'),
      },
      {
        partnerId: 12,
        orderReference: 'ord-1',
        eventType: 'paid',
        points: 200,
        earnedPoints: 200,
        conversionRate: 1.25,
        createdAt: new Date('2026-09-02T00:00:00Z'),
      },
      {
        partnerId: 12,
        orderReference: 'ord-1',
        eventType: 'reversal',
        points: -50,
        conversionRate: 1.25,
        createdAt: new Date('2026-09-03T00:00:00Z'),
      },
    ];

    expect(summarizeRewardLedger(events)).toEqual({
      pending: 0,
      earned: 150,
      reversed: 50,
      settled: 0,
      available: 150,
    });
  });

  it('requires a qualifying accepted order before points can be earned', async () => {
    const access: PartnerRewardAccess = {
      workspace: async (currentSession, partnerId) =>
        partnerId === currentSession.partner.businessPartnerId
          ? { status: 'authenticated', session: currentSession }
          : { status: 'authorization-denied', session: currentSession },
      verifySettlement: async () => true,
    };
    const ledger: PartnerRewardEvent[] = [];
    const rewards = createPartnerRewards(
      {
        ledger: async () => ledger,
        append: async (event) => {
          ledger.push(event);
        },
      },
      access,
    );

    const result = await rewards.recordPayment(session, 12, 'missing-order', {
      points: 15,
      paidAt: new Date('2026-09-05T00:00:00Z'),
      fulfillment: 'delivery',
      fulfillmentCompleted: true,
    });

    expect(result).toEqual({ status: 'invalid-input' });
    expect(ledger).toEqual([]);
  });

  it('authorizes partner administrators and records append-only adjustments', async () => {
    const access: PartnerRewardAccess = {
      workspace: async (currentSession, partnerId) =>
        partnerId === currentSession.partner.businessPartnerId
          ? { status: 'authenticated', session: currentSession }
          : { status: 'authorization-denied', session: currentSession },
      verifySettlement: async () => true,
    };
    const ledger: PartnerRewardEvent[] = [];
    const rewards = createPartnerRewards(
      {
        ledger: async () => ledger,
        append: async (event) => {
          ledger.push(event);
        },
      },
      access,
    );

    const accepted = await rewards.recordOrder(session, 12, {
      orderReference: 'ord-2',
      points: 80,
      conversionRate: 1.1,
    });
    expect(accepted.status).toBe('accepted');

    const paid = await rewards.recordPayment(session, 12, 'ord-2', {
      paidAt: new Date('2026-09-05T00:00:00Z'),
      fulfillment: 'delivery',
      fulfillmentCompleted: true,
    });
    expect(paid.status).toBe('earned');

    const adjusted = await rewards.recordAdjustment(session, 12, {
      orderReference: 'ord-2',
      points: -20,
      reason: 'manual adjustment',
    });
    expect(adjusted.status).toBe('recorded');

    expect(summarizeRewardLedger(ledger)).toEqual({
      pending: 0,
      earned: 60,
      reversed: 0,
      settled: 0,
      available: 60,
    });
  });

  it('requires completed delivery or collection before earning points', async () => {
    const ledger: PartnerRewardEvent[] = [
      {
        partnerId: 12,
        orderReference: 'ord-3',
        eventType: 'accepted',
        points: 40,
        pendingPoints: 40,
        conversionRate: 1.2,
        createdAt: new Date('2026-09-01T00:00:00Z'),
      },
    ];
    const rewards = createPartnerRewards(
      {
        ledger: async () => ledger,
        append: async (event) => {
          ledger.push(event);
        },
      },
      {
        workspace: async (currentSession) => ({ status: 'authenticated', session: currentSession }),
        verifySettlement: async () => true,
      },
    );

    expect(
      await rewards.recordPayment(session, 12, 'ord-3', {
        fulfillment: 'delivery',
        fulfillmentCompleted: false,
      }),
    ).toEqual({ status: 'invalid-input' });
    expect(ledger).toHaveLength(1);
  });

  it('records refunds and requires verified bank settlements', async () => {
    const ledger: PartnerRewardEvent[] = [
      {
        partnerId: 12,
        orderReference: 'ord-4',
        eventType: 'accepted',
        points: 100,
        pendingPoints: 100,
        createdAt: new Date('2026-09-01T00:00:00Z'),
      },
      {
        partnerId: 12,
        orderReference: 'ord-4',
        eventType: 'paid',
        points: 100,
        earnedPoints: 100,
        createdAt: new Date('2026-09-02T00:00:00Z'),
      },
    ];
    const rewards = createPartnerRewards(
      {
        ledger: async () => ledger,
        append: async (event) => {
          ledger.push(event);
        },
      },
      {
        workspace: async (currentSession) => ({ status: 'authenticated', session: currentSession }),
        verifySettlement: async (_currentSession, _partnerId, bankAccountId, settlementReference) =>
          bankAccountId === 'bank-1' && settlementReference === 'settle-1',
      },
    );

    const refund = await rewards.recordRefund(session, 12, {
      orderReference: 'ord-4',
      points: 25,
      reason: 'customer refund',
    });
    expect(refund.status).toBe('refunded');
    const cancellation = await rewards.recordCancellation(session, 12, {
      orderReference: 'ord-4',
      points: 25,
      reason: 'order cancelled',
    });
    expect(cancellation.status).toBe('cancelled');
    expect(
      await rewards.recordReversal(session, 12, {
        orderReference: 'ord-4',
        points: 51,
        reason: 'over reversal',
      }),
    ).toEqual({ status: 'invalid-input' });
    expect(
      await rewards.recordSettlement(session, 12, {
        orderReference: 'settlement-1',
        points: 50,
        reason: 'weekly settlement',
      }),
    ).toEqual({ status: 'invalid-input' });
    expect(
      await rewards.recordSettlement(session, 12, {
        orderReference: 'settlement-1',
        points: 50,
        reason: 'weekly settlement',
        verifiedBankAccountId: 'bank-1',
        settlementReference: 'settle-1',
      }),
    ).toMatchObject({ status: 'settled' });
  });
});
