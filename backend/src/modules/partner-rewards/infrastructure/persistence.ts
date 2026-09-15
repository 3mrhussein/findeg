import { and, asc, desc, eq, sql } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import {
  partnerRewardRates,
  partnerRewardEntitlements,
  partnerRewardEvents,
  partnerRewardOutcomes,
  partnerRewardVerifiedBankAccounts,
} from '@findeg/db/modules/partner-rewards';
import {
  summarizeRewardStatement,
  canCorrectReward,
  correctionValue,
  allocateRewardValue,
  toValuedRewardEvent,
  minor,
  format,
  type ValuedRewardEvent,
  type DurablePartnerRewardStore,
} from '../public.js';

function rateSnapshot(rate: typeof partnerRewardRates.$inferSelect) {
  return {
    id: rate.id,
    businessPartnerId: rate.businessPartnerId,
    pointsPerEgp: rate.pointsPerEgp,
    egpPerPoint: rate.egpPerPoint,
  };
}
export function bindPartnerRewardStore(database: TransactionDatabase): DurablePartnerRewardStore {
  // The stable partner key also locks a missing rate, serializing first configuration with quotes.
  const lockRate = (partnerId: number) =>
    database.execute(sql`SELECT pg_advisory_xact_lock(93001, ${partnerId})`);
  const lockPartnerLedger = (partnerId: number) =>
    database.execute(sql`SELECT pg_advisory_xact_lock(93003, ${partnerId})`);
  const lockOutcome = (actorId: number, operation: string, key: string) =>
    database.execute(
      sql`SELECT pg_advisory_xact_lock(93004, hashtext(${`${actorId}:${operation}:${key}`}))`,
    );
  const outcome = async <Result extends { readonly status: string }>(
    actorId: number,
    operation: string,
    key: string,
  ) => {
    await lockOutcome(actorId, operation, key);
    const [saved] = await database
      .select()
      .from(partnerRewardOutcomes)
      .where(
        and(
          eq(partnerRewardOutcomes.actorId, actorId),
          eq(partnerRewardOutcomes.operation, operation),
          eq(partnerRewardOutcomes.key, key),
        ),
      );
    return saved as (typeof saved & { outcome: Result }) | undefined;
  };
  const saveOutcome = (input: {
    actorId: number;
    operation: string;
    key: string;
    fingerprint: string;
    result: { readonly status: string };
  }) =>
    database.insert(partnerRewardOutcomes).values({
      actorId: input.actorId,
      operation: input.operation,
      key: input.key,
      fingerprint: input.fingerprint,
      outcome: input.result,
    });
  const events = async (partnerId: number, orderReference?: string) => {
    const rows = await database
      .select({
        event: partnerRewardEvents,
        value: sql<string | null>`coalesce(${partnerRewardEvents.value},
          CASE WHEN ${partnerRewardEvents.entitlementId} IS NOT NULL AND ${partnerRewardEvents.eventType} IN ('accepted','paid') THEN ${partnerRewardEntitlements.rewardValue}
          WHEN ${partnerRewardEvents.conversionRate} IS NOT NULL THEN round(${partnerRewardEvents.points} * ${partnerRewardEvents.conversionRate}, 2)
          ELSE NULL END)`,
      })
      .from(partnerRewardEvents)
      .leftJoin(
        partnerRewardEntitlements,
        eq(partnerRewardEntitlements.id, partnerRewardEvents.entitlementId),
      )
      .where(
        orderReference === undefined
          ? eq(partnerRewardEvents.businessPartnerId, partnerId)
          : and(
              eq(partnerRewardEvents.businessPartnerId, partnerId),
              eq(partnerRewardEvents.orderReference, orderReference),
            ),
      )
      .orderBy(asc(partnerRewardEvents.id));
    return rows.map(({ event: row, value }): ValuedRewardEvent => ({
      ...toValuedRewardEvent({ ...row, value }),
      ...(row.conversionRate === null ? {} : { conversionRate: Number(row.conversionRate) }),
      ...(row.fulfillment === null
        ? {}
        : { fulfillment: row.fulfillment as 'delivery' | 'collection' }),
      ...(row.fulfillmentCompleted === null
        ? {}
        : { fulfillmentCompleted: row.fulfillmentCompleted }),
      ...(row.verifiedBankAccountId === null
        ? {}
        : { verifiedBankAccountId: row.verifiedBankAccountId }),
      ...(row.settlementReference === null ? {} : { settlementReference: row.settlementReference }),
      ...(row.reason === null ? {} : { reason: row.reason }),
    }));
  };
  return {
    async earnDeliveredOrder(orderReference, actorId) {
      const rows = await database
        .select({ entitlement: partnerRewardEntitlements, rate: partnerRewardRates })
        .from(partnerRewardEntitlements)
        .innerJoin(partnerRewardRates, eq(partnerRewardRates.id, partnerRewardEntitlements.rateId))
        .where(eq(partnerRewardEntitlements.orderReference, orderReference))
        .orderBy(partnerRewardEntitlements.id);
      const remaining = new Map<number, { points: bigint; value: string | null }>();
      for (const partnerId of [
        ...new Set(rows.map(({ entitlement }) => entitlement.businessPartnerId)),
      ].sort((a, b) => a - b)) {
        await lockPartnerLedger(partnerId);
        const statement = summarizeRewardStatement(await events(partnerId, orderReference));
        remaining.set(partnerId, {
          points: BigInt(statement.points.pending),
          value: statement.value?.pending ?? null,
        });
      }
      for (const { entitlement, rate } of rows) {
        const balance = remaining.get(entitlement.businessPartnerId)!;
        const points = Number(
          balance.points < BigInt(entitlement.points) ? balance.points : BigInt(entitlement.points),
        );
        const value =
          balance.value === null
            ? null
            : allocateRewardValue(balance.value, BigInt(points), balance.points);
        if (value !== null && balance.value !== null) {
          balance.value = format(minor(balance.value) - minor(value));
        }
        balance.points -= BigInt(points);
        await database
          .insert(partnerRewardEvents)
          .values({
            entitlementId: entitlement.id,
            businessPartnerId: entitlement.businessPartnerId,
            orderReference,
            eventType: 'paid',
            actorId,
            points,
            earnedPoints: points,
            value,
            conversionRate: rate.egpPerPoint,
            fulfillment: 'delivery',
            fulfillmentCompleted: true,
          })
          .onConflictDoNothing();
      }
    },
    async rateForPartner(partnerId) {
      await lockRate(partnerId);
      const [rate] = await database
        .select()
        .from(partnerRewardRates)
        .where(eq(partnerRewardRates.businessPartnerId, partnerId))
        .orderBy(desc(partnerRewardRates.id))
        .limit(1);
      return rate && rateSnapshot(rate);
    },
    async configureRate(partnerId, actorId, input) {
      await database.execute(
        sql`SELECT pg_advisory_xact_lock(93002, hashtext(${`${actorId}:${input.key}`}))`,
      );
      const [saved] = await database
        .select()
        .from(partnerRewardRates)
        .where(
          and(
            eq(partnerRewardRates.actorId, actorId),
            eq(partnerRewardRates.requestKey, input.key),
          ),
        );
      if (saved)
        return saved.businessPartnerId === partnerId &&
          saved.pointsPerEgp === input.pointsPerEgp &&
          saved.egpPerPoint === input.egpPerPoint
          ? { status: 'configured', rate: rateSnapshot(saved) }
          : { status: 'idempotency-conflict' };
      await lockRate(partnerId);
      const [rate] = await database
        .insert(partnerRewardRates)
        .values({
          businessPartnerId: partnerId,
          actorId,
          requestKey: input.key,
          pointsPerEgp: input.pointsPerEgp,
          egpPerPoint: input.egpPerPoint,
        })
        .returning();
      return { status: 'configured', rate: rateSnapshot(rate) };
    },
    async recordPending(orderReference, lines) {
      for (const line of lines) {
        const [entitlement] = await database
          .insert(partnerRewardEntitlements)
          .values({
            orderReference,
            businessPartnerId: line.businessPartnerId,
            lineIndex: line.lineIndex,
            rateId: line.reward.rateId,
            eligibleSubtotal: line.eligibleSubtotal,
            points: line.reward.points,
            rewardValue: line.reward.rewardValue,
          })
          .returning();
        await database.insert(partnerRewardEvents).values({
          entitlementId: entitlement.id,
          businessPartnerId: line.businessPartnerId,
          orderReference,
          eventType: 'accepted',
          points: line.reward.points,
          pendingPoints: line.reward.points,
          value: line.reward.rewardValue,
          conversionRate: line.reward.egpPerPoint,
        });
      }
    },
    async entitlementsForOrder(orderReference) {
      const rows = await database
        .select({ entitlement: partnerRewardEntitlements, rate: partnerRewardRates })
        .from(partnerRewardEntitlements)
        .innerJoin(partnerRewardRates, eq(partnerRewardRates.id, partnerRewardEntitlements.rateId))
        .where(eq(partnerRewardEntitlements.orderReference, orderReference))
        .orderBy(partnerRewardEntitlements.lineIndex);
      return rows.map(({ entitlement, rate }) => ({
        id: entitlement.id,
        orderReference,
        lineIndex: entitlement.lineIndex,
        businessPartnerId: entitlement.businessPartnerId,
        eligibleSubtotal: entitlement.eligibleSubtotal,
        reward: {
          rateId: rate.id,
          pointsPerEgp: rate.pointsPerEgp,
          egpPerPoint: rate.egpPerPoint,
          points: entitlement.points,
          rewardValue: entitlement.rewardValue,
        },
      }));
    },
    async verifyBankAccount({ partnerId, actorId, fingerprint, verification }) {
      const operation = 'bank-account-verification';
      const saved = await outcome<{ readonly status: 'bank-account-verified' }>(
        actorId,
        operation,
        verification.key,
      );
      if (saved)
        return saved.fingerprint === fingerprint
          ? saved.outcome
          : ({ status: 'idempotency-conflict' } as const);
      await lockPartnerLedger(partnerId);
      await database
        .insert(partnerRewardVerifiedBankAccounts)
        .values({
          businessPartnerId: partnerId,
          bankAccountId: verification.bankAccountId,
          verifiedBy: actorId,
        })
        .onConflictDoNothing();
      const result = { status: 'bank-account-verified' } as const;
      await saveOutcome({ actorId, operation, key: verification.key, fingerprint, result });
      return result;
    },
    async recordCorrection({ partnerId, actorId, fingerprint, correction }) {
      const operation = `correction:${correction.action}`;
      const saved = await outcome<import('../contracts.js').PartnerRewardCorrectionResult>(
        actorId,
        operation,
        correction.key,
      );
      if (saved)
        return saved.fingerprint === fingerprint
          ? saved.outcome
          : ({ status: 'idempotency-conflict' } as const);
      await lockPartnerLedger(partnerId);
      const prior = await events(
        partnerId,
        correction.action === 'settlement' ? undefined : correction.orderReference,
      );
      let result: import('../contracts.js').PartnerRewardCorrectionResult;
      if (correction.action === 'settlement') {
        const [bank] = await database
          .select({ id: partnerRewardVerifiedBankAccounts.id })
          .from(partnerRewardVerifiedBankAccounts)
          .where(
            and(
              eq(partnerRewardVerifiedBankAccounts.businessPartnerId, partnerId),
              eq(
                partnerRewardVerifiedBankAccounts.bankAccountId,
                correction.verifiedBankAccountId!,
              ),
            ),
          )
          .for('share');
        result = !bank
          ? { status: 'bank-account-unverified' }
          : !canCorrectReward(prior, 'settlement', correction.points)
            ? { status: 'reward-unavailable' }
            : { status: 'settled' };
      } else if (canCorrectReward(prior, correction.action, correction.points)) {
        result = {
          status:
            correction.action === 'refund'
              ? 'refunded'
              : correction.action === 'cancellation'
                ? 'cancelled'
                : correction.action === 'reversal'
                  ? 'reversed'
                  : 'recorded',
        };
      } else {
        result = { status: 'reward-unavailable' };
      }
      if (result.status === 'bank-account-unverified' || result.status === 'reward-unavailable')
        return result;
      const value = correctionValue(prior, correction);
      if (value === undefined) return { status: 'reward-unavailable' };
      await database.insert(partnerRewardEvents).values({
        value,
        businessPartnerId: partnerId,
        orderReference: correction.orderReference,
        eventType: correction.action,
        actorId,
        points:
          correction.action === 'refund' ||
          correction.action === 'cancellation' ||
          correction.action === 'reversal'
            ? -correction.points
            : correction.points,
        ...(correction.reason === undefined ? {} : { reason: correction.reason }),
        ...(correction.action === 'settlement'
          ? {
              verifiedBankAccountId: correction.verifiedBankAccountId,
              settlementReference: correction.settlementReference,
            }
          : {}),
      });
      await saveOutcome({ actorId, operation, key: correction.key, fingerprint, result });
      return result;
    },
  };
}
