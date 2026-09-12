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

  it('authorizes partner administrators and records append-only adjustments', async () => {
    const access: PartnerRewardAccess = {
      workspace: async (currentSession, partnerId) =>
        partnerId === currentSession.partner.businessPartnerId
          ? { status: 'authenticated', session: currentSession }
          : { status: 'authorization-denied', session: currentSession },
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
});
