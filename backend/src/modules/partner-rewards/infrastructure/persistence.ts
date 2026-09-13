import { and, desc, eq, sql } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import {
  partnerRewardRates,
  partnerRewardEntitlements,
  partnerRewardEvents,
} from '@findeg/db/modules/partner-rewards';
import type { DurablePartnerRewardStore } from '../public.js';

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
  return {
    async earnDeliveredOrder(orderReference, actorId) {
      const rows = await database
        .select({ entitlement: partnerRewardEntitlements, rate: partnerRewardRates })
        .from(partnerRewardEntitlements)
        .innerJoin(partnerRewardRates, eq(partnerRewardRates.id, partnerRewardEntitlements.rateId))
        .where(eq(partnerRewardEntitlements.orderReference, orderReference))
        .orderBy(partnerRewardEntitlements.id);
      for (const { entitlement, rate } of rows) {
        await database
          .insert(partnerRewardEvents)
          .values({
            entitlementId: entitlement.id,
            businessPartnerId: entitlement.businessPartnerId,
            orderReference,
            eventType: 'paid',
            actorId,
            points: entitlement.points,
            earnedPoints: entitlement.points,
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
  };
}
