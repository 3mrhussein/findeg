import {
  getActorEmails,
  listRewardAdjustmentLinesInMonth,
  listRewardEntitlementDetails,
  listRewardSettlementLines,
  type RewardsExecutor,
} from '@findeg/db/queries/rewards';
import { REWARDS_TIME_ZONE } from './months';
import type { RewardEventType, RewardSettlementKind } from '@findeg/db/schema';

/** Staff-only detail the Partner projection never carries: references, notes, reasons, actors. */
export interface StaffActorView {
  readonly userId: number;
  readonly email: string | null;
}

export interface StaffEntitlementView {
  readonly id: number;
  readonly orderId: number;
  readonly orderReference: string;
  readonly listItemId: number | null;
  readonly variantId: number | null;
  readonly productName: string | null;
  readonly points: bigint;
  readonly egpValuePiasters: bigint;
  /** Every event of the entitlement, oldest first, whatever month each was recorded in. */
  readonly events: readonly {
    readonly type: RewardEventType;
    readonly points: bigint;
    readonly egpValuePiasters: bigint;
    readonly recordedAt: Date;
  }[];
}

export interface StaffAdjustmentView {
  readonly id: number;
  readonly kind: 'adjustment' | 'debt-forgiveness';
  /** Signed EGP in piasters. */
  readonly egpPiasters: bigint;
  readonly reason: string | null;
  readonly actor: StaffActorView | null;
  readonly recordedAt: Date;
}

export interface StaffSettlementLineView {
  readonly id: number;
  readonly kind: RewardSettlementKind;
  /** EGP in piasters: positive for a settlement or debt forgiveness, negative for a void. */
  readonly amountPiasters: bigint;
  readonly transferReference: string | null;
  /** `YYYY-MM-DD`: when Finance made the transfer. The line is placed by `recordedAt`, not this. */
  readonly paidAt: string | null;
  readonly notes: string | null;
  readonly reason: string | null;
  readonly voidsSettlementId: number | null;
  readonly actor: StaffActorView | null;
  readonly recordedAt: Date;
}

export interface StaffReportDetail {
  readonly entitlements: readonly StaffEntitlementView[];
  readonly adjustments: readonly StaffAdjustmentView[];
  readonly settlements: readonly StaffSettlementLineView[];
}

/** Reads the Staff-only detail for one month. Callers have already checked `rewards.view`. */
export async function readStaffReportDetail(
  tx: RewardsExecutor,
  businessPartnerId: number,
  month: string,
): Promise<StaffReportDetail> {
  const [entitlements, adjustments, settlements] = await Promise.all([
    listRewardEntitlementDetails(tx, businessPartnerId, month, REWARDS_TIME_ZONE),
    listRewardAdjustmentLinesInMonth(tx, businessPartnerId, month, REWARDS_TIME_ZONE),
    listRewardSettlementLines(tx, businessPartnerId),
  ]);
  const actorIds = [...adjustments, ...settlements].flatMap((row) =>
    row.actorUserId === null ? [] : [row.actorUserId],
  );
  const emails = await getActorEmails(tx, [...new Set(actorIds)]);
  const actorOf = (userId: number | null): StaffActorView | null =>
    userId === null ? null : { userId, email: emails.get(userId) ?? null };

  return {
    entitlements: entitlements.map((entitlement) => ({
      id: entitlement.id,
      orderId: entitlement.orderId,
      orderReference: entitlement.orderReference,
      listItemId: entitlement.listItemId,
      variantId: entitlement.variantId,
      productName: entitlement.productNameSnapshot,
      points: entitlement.points,
      egpValuePiasters: entitlement.egpValuePiasters,
      events: entitlement.events.map(({ id: _id, ...event }) => event),
    })),
    adjustments: adjustments.map((row) => ({
      id: row.id,
      kind: row.kind,
      egpPiasters: row.egpPiasters,
      reason: row.reason,
      actor: actorOf(row.actorUserId),
      recordedAt: row.recordedAt,
    })),
    settlements: settlements.map((row) => ({
      id: row.id,
      kind: row.kind,
      amountPiasters: row.amountPiasters,
      transferReference: row.transferReference,
      paidAt: row.paidAt,
      notes: row.notes,
      reason: row.reason,
      voidsSettlementId: row.voidsSettlementId,
      actor: actorOf(row.actorUserId),
      recordedAt: row.createdAt,
    })),
  };
}
