import type { PartnerSession } from '../partner-management/contracts.js';
import type {
  PartnerAdjustmentInput,
  PartnerPaymentInput,
  PartnerRewardEvent,
  PartnerRewardInput,
  PartnerRewardSummary,
} from './contracts.js';

export type {
  PartnerAdjustmentInput,
  PartnerPaymentInput,
  PartnerRewardEvent,
  PartnerRewardInput,
  PartnerRewardSummary,
} from './contracts.js';

export interface PartnerRewardLedgerStore {
  readonly ledger: () => Promise<readonly PartnerRewardEvent[]>;
  readonly append: (event: PartnerRewardEvent) => Promise<void>;
}

export interface PartnerRewardAccess {
  readonly workspace: (
    session: PartnerSession,
    partnerId: number,
  ) => Promise<
    | { readonly status: 'authenticated'; readonly session: PartnerSession }
    | { readonly status: 'authorization-denied'; readonly session: PartnerSession }
  >;
  readonly verifySettlement: (
    session: PartnerSession,
    partnerId: number,
    bankAccountId: string,
    settlementReference: string,
  ) => Promise<boolean>;
}

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number.isInteger(value);

export function summarizeRewardLedger(events: readonly PartnerRewardEvent[]): PartnerRewardSummary {
  const pendingByOrder = new Map<string, number>();
  let earned = 0;
  let reversed = 0;
  let settled = 0;

  for (const event of events) {
    const amount = Number.isFinite(event.points) ? event.points : 0;
    const orderKey = JSON.stringify([event.partnerId, event.orderReference]);
    const pending = pendingByOrder.get(orderKey) ?? 0;
    switch (event.eventType) {
      case 'accepted': {
        pendingByOrder.set(orderKey, pending + (event.pendingPoints ?? amount));
        break;
      }
      case 'paid': {
        const value = event.earnedPoints ?? amount;
        earned += value;
        pendingByOrder.set(orderKey, Math.max(0, pending - value));
        break;
      }
      case 'cancellation': {
        const cancelledPending = Math.min(pending, Math.max(0, -amount));
        pendingByOrder.set(orderKey, pending - cancelledPending);
        reversed += Math.max(0, -amount);
        earned += amount + cancelledPending;
        break;
      }
      case 'refund':
      case 'reversal': {
        reversed += Math.abs(amount < 0 ? amount : 0);
        earned += amount;
        break;
      }
      case 'adjustment': {
        earned += amount;
        break;
      }
      case 'settlement': {
        settled += Math.max(0, amount);
        break;
      }
      default:
        break;
    }
  }

  return {
    pending: [...pendingByOrder.values()].reduce((total, value) => total + value, 0),
    earned: Math.max(0, earned),
    reversed: Math.max(0, reversed),
    settled: Math.max(0, settled),
    available: Math.max(0, earned - settled),
  };
}

export function createPartnerRewards(store: PartnerRewardLedgerStore, access: PartnerRewardAccess) {
  const record = async (
    session: PartnerSession,
    partnerId: number,
    event: Omit<PartnerRewardEvent, 'partnerId' | 'createdAt'> & { createdAt?: Date },
  ) => {
    const allowed = await access.workspace(session, partnerId);
    if (allowed.status !== 'authenticated')
      return { status: 'authorization-denied' as const, session };

    const item: PartnerRewardEvent = {
      partnerId,
      ...event,
      createdAt: event.createdAt ?? new Date(),
    };
    await store.append(item);
    return { status: 'recorded' as const, event: item };
  };

  return {
    async recordOrder(session: PartnerSession, partnerId: number, input: PartnerRewardInput) {
      if (
        !Number.isSafeInteger(partnerId) ||
        partnerId <= 0 ||
        !input ||
        typeof input.orderReference !== 'string' ||
        input.orderReference.trim().length === 0 ||
        !isPositiveInteger(input.points) ||
        (input.conversionRate !== undefined &&
          (!Number.isFinite(input.conversionRate) || input.conversionRate <= 0))
      ) {
        return { status: 'invalid-input' as const };
      }

      const result = await record(session, partnerId, {
        orderReference: input.orderReference,
        eventType: 'accepted',
        points: input.points,
        pendingPoints: input.points,
        conversionRate: input.conversionRate,
      });
      return result.status === 'recorded'
        ? { status: 'accepted' as const, event: result.event }
        : result;
    },
    async recordPayment(
      session: PartnerSession,
      partnerId: number,
      orderReference: string,
      input: PartnerPaymentInput,
    ) {
      if (
        !Number.isSafeInteger(partnerId) ||
        partnerId <= 0 ||
        typeof orderReference !== 'string' ||
        orderReference.trim().length === 0 ||
        !['delivery', 'collection'].includes(input.fulfillment) ||
        input.fulfillmentCompleted !== true ||
        (input.points !== undefined && (!Number.isInteger(input.points) || input.points <= 0))
      ) {
        return { status: 'invalid-input' as const };
      }

      const current = await store.ledger();
      const prior = current.filter(
        (event) => event.partnerId === partnerId && event.orderReference === orderReference,
      );
      const { pending } = summarizeRewardLedger(prior);

      if (pending <= 0) {
        return { status: 'invalid-input' as const };
      }

      const points = input.points ?? pending;
      if (!Number.isSafeInteger(points) || points <= 0 || points > pending) {
        return { status: 'invalid-input' as const };
      }

      const result = await record(session, partnerId, {
        orderReference,
        eventType: 'paid',
        points,
        earnedPoints: points,
        createdAt: input.paidAt,
      });
      return result.status === 'recorded'
        ? { status: 'earned' as const, event: result.event }
        : result;
    },
    async recordRefund(session: PartnerSession, partnerId: number, input: PartnerAdjustmentInput) {
      if (
        !input ||
        typeof input.orderReference !== 'string' ||
        input.orderReference.trim().length === 0 ||
        !Number.isSafeInteger(input.points) ||
        input.points <= 0
      ) {
        return { status: 'invalid-input' as const };
      }

      const prior = (await store.ledger()).filter(
        (event) => event.partnerId === partnerId && event.orderReference === input.orderReference,
      );
      const { earned } = summarizeRewardLedger(prior);
      if (prior.every((event) => event.eventType !== 'paid') || input.points > earned) {
        return { status: 'invalid-input' as const };
      }

      const result = await record(session, partnerId, {
        orderReference: input.orderReference,
        eventType: 'refund',
        points: -input.points,
        reason: input.reason,
      });
      return result.status === 'recorded'
        ? { status: 'refunded' as const, event: result.event }
        : result;
    },
    async recordReversal(
      session: PartnerSession,
      partnerId: number,
      input: PartnerAdjustmentInput,
    ) {
      if (
        !input ||
        typeof input.orderReference !== 'string' ||
        input.orderReference.trim().length === 0 ||
        !Number.isSafeInteger(input.points) ||
        input.points <= 0
      ) {
        return { status: 'invalid-input' as const };
      }
      const prior = (await store.ledger()).filter(
        (event) => event.partnerId === partnerId && event.orderReference === input.orderReference,
      );
      const { earned } = summarizeRewardLedger(prior);
      if (prior.every((event) => event.eventType !== 'accepted') || input.points > earned) {
        return { status: 'invalid-input' as const };
      }
      const result = await record(session, partnerId, {
        orderReference: input.orderReference,
        eventType: 'reversal',
        points: -input.points,
        reason: input.reason,
      });
      return result.status === 'recorded'
        ? { status: 'reversed' as const, event: result.event }
        : result;
    },
    async recordCancellation(
      session: PartnerSession,
      partnerId: number,
      input: PartnerAdjustmentInput,
    ) {
      if (
        !input ||
        typeof input.orderReference !== 'string' ||
        input.orderReference.trim().length === 0 ||
        !Number.isSafeInteger(input.points) ||
        input.points <= 0
      ) {
        return { status: 'invalid-input' as const };
      }
      const prior = (await store.ledger()).filter(
        (event) => event.partnerId === partnerId && event.orderReference === input.orderReference,
      );
      const { pending, earned } = summarizeRewardLedger(prior);
      if (
        prior.every((event) => event.eventType !== 'accepted') ||
        input.points > pending + earned
      ) {
        return { status: 'invalid-input' as const };
      }
      const result = await record(session, partnerId, {
        orderReference: input.orderReference,
        eventType: 'cancellation',
        points: -input.points,
        reason: input.reason,
      });
      return result.status === 'recorded'
        ? { status: 'cancelled' as const, event: result.event }
        : result;
    },
    async recordAdjustment(
      session: PartnerSession,
      partnerId: number,
      input: PartnerAdjustmentInput,
    ) {
      if (
        !input ||
        typeof input.orderReference !== 'string' ||
        input.orderReference.trim().length === 0 ||
        !Number.isInteger(input.points) ||
        input.points === 0
      ) {
        return { status: 'invalid-input' as const };
      }
      const result = await record(session, partnerId, {
        orderReference: input.orderReference,
        eventType: 'adjustment',
        points: input.points,
        reason: input.reason,
      });
      return result.status === 'recorded'
        ? { status: 'recorded' as const, event: result.event }
        : result;
    },
    async recordSettlement(
      session: PartnerSession,
      partnerId: number,
      input: PartnerAdjustmentInput,
    ) {
      if (
        !input ||
        typeof input.orderReference !== 'string' ||
        input.orderReference.trim().length === 0 ||
        !isPositiveInteger(input.points) ||
        typeof input.verifiedBankAccountId !== 'string' ||
        input.verifiedBankAccountId.trim().length === 0 ||
        typeof input.settlementReference !== 'string' ||
        input.settlementReference.trim().length === 0 ||
        !(await access.verifySettlement(
          session,
          partnerId,
          input.verifiedBankAccountId,
          input.settlementReference,
        ))
      ) {
        return { status: 'invalid-input' as const };
      }
      const result = await record(session, partnerId, {
        orderReference: input.orderReference,
        eventType: 'settlement',
        points: input.points,
        reason: input.reason,
        verifiedBankAccountId: input.verifiedBankAccountId,
        settlementReference: input.settlementReference,
      });
      return result.status === 'recorded'
        ? { status: 'settled' as const, event: result.event }
        : result;
    },
  };
}

export { rewardRateInput, valueRewardLine } from './valuation.js';
export type {
  PartnerRewardRate,
  RewardSnapshot,
  PendingRewardLine,
  RewardEntitlement,
  RewardRateInput,
} from './contracts.js';

/** Infrastructure binds these purpose-specific writes to the workflow transaction. */
export interface DurablePartnerRewardStore {
  rateForPartner(
    partnerId: number,
  ): Promise<import('./contracts.js').PartnerRewardRate | undefined>;
  configureRate(
    partnerId: number,
    actorId: number,
    input: import('./contracts.js').RewardRateInput,
  ): Promise<
    | { readonly status: 'configured'; readonly rate: import('./contracts.js').PartnerRewardRate }
    | { readonly status: 'idempotency-conflict' }
  >;
  recordPending(
    orderReference: string,
    lines: readonly import('./contracts.js').PendingRewardLine[],
  ): Promise<void>;
  entitlementsForOrder(
    orderReference: string,
  ): Promise<readonly import('./contracts.js').RewardEntitlement[]>;
}
