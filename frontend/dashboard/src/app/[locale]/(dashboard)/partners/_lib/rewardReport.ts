import type { StaffRewardReportView } from '@findeg/backend/features/partner-rewards';

/** Exact signed piasters as EGP text, never through a JS number. */
export function formatEgp(piasters: bigint): string {
  const sign = piasters < 0n ? '-' : '';
  const magnitude = piasters < 0n ? -piasters : piasters;
  return `${sign}${magnitude / 100n}.${(magnitude % 100n).toString().padStart(2, '0')}`;
}

export interface AmountProps {
  readonly points: string;
  readonly egp: string;
}

const amount = (value: { points: bigint; egpPiasters: bigint }): AmountProps => ({
  points: value.points.toString(),
  egp: formatEgp(value.egpPiasters),
});

export interface RewardReportProps {
  readonly asOf: string;
  readonly month: string;
  readonly months: readonly string[];
  readonly statement: {
    readonly openingEgp: string;
    readonly earned: AmountProps;
    readonly reversed: AmountProps;
    readonly adjustmentsEgp: string;
    readonly settledEgp: string;
    readonly closingEgp: string;
  };
  readonly pending: AmountProps;
  /** Signed. Negative when reversals after the last payout exceeded the balance. */
  readonly availableBalanceEgp: string;
  readonly sales: readonly {
    readonly key: string;
    readonly listName: string | null;
    readonly listItemLabel: string | null;
    readonly productName: string | null;
    readonly variantLabel: string | null;
    readonly earned: AmountProps;
    readonly reversed: AmountProps;
    readonly orderCount: number;
  }[];
  readonly entitlements: readonly {
    readonly id: number;
    readonly orderReference: string;
    readonly productName: string | null;
    readonly points: string;
    readonly egp: string;
    readonly events: readonly {
      readonly type: string;
      readonly points: string;
      readonly egp: string;
      readonly recordedAt: string;
    }[];
  }[];
  readonly adjustments: readonly {
    readonly id: number;
    readonly egp: string;
    readonly reason: string | null;
    readonly actor: string | null;
    readonly recordedAt: string;
  }[];
  readonly settlements: readonly {
    readonly id: number;
    readonly kind: string;
    readonly egp: string;
    readonly transferReference: string | null;
    readonly paidAt: string | null;
    readonly notes: string | null;
    readonly reason: string | null;
    readonly actor: string | null;
    readonly recordedAt: string;
  }[];
}

const actorLabel = (actor: { userId: number; email: string | null } | null) =>
  actor ? (actor.email ?? `User ${actor.userId}`) : null;

/** Serializable props for the Rewards tab. Bigints never cross the server/client boundary. */
export function toRewardReportProps(report: StaffRewardReportView): RewardReportProps {
  const { statement } = report;
  return {
    asOf: report.asOf.toISOString(),
    month: statement.month,
    months: report.months,
    statement: {
      openingEgp: formatEgp(statement.openingEgpPiasters),
      earned: amount(statement.earned),
      reversed: amount(statement.reversed),
      adjustmentsEgp: formatEgp(statement.adjustmentsEgpPiasters),
      settledEgp: formatEgp(statement.settledEgpPiasters),
      closingEgp: formatEgp(statement.closingEgpPiasters),
    },
    pending: amount(report.pending),
    availableBalanceEgp: formatEgp(report.availableBalanceEgpPiasters),
    sales: report.sales.map((row) => ({
      key: `${row.listId}-${row.listItemId}-${row.variantId}`,
      listName: row.listName,
      listItemLabel: row.listItemLabel,
      productName: row.productName,
      variantLabel: row.variantLabel,
      earned: amount(row.earned),
      reversed: amount(row.reversed),
      orderCount: row.orderCount,
    })),
    entitlements: report.entitlements.map((entitlement) => ({
      id: entitlement.id,
      orderReference: entitlement.orderReference,
      productName: entitlement.productName,
      points: entitlement.points.toString(),
      egp: formatEgp(entitlement.egpValuePiasters),
      events: entitlement.events.map((event) => ({
        type: event.type,
        points: event.points.toString(),
        egp: formatEgp(event.egpValuePiasters),
        recordedAt: event.recordedAt.toISOString(),
      })),
    })),
    adjustments: report.adjustments.map((row) => ({
      id: row.id,
      egp: formatEgp(row.egpPiasters),
      reason: row.reason,
      actor: actorLabel(row.actor),
      recordedAt: row.recordedAt.toISOString(),
    })),
    settlements: report.settlements.map((row) => ({
      id: row.id,
      kind: row.kind,
      egp: formatEgp(row.amountPiasters),
      transferReference: row.transferReference,
      paidAt: row.paidAt,
      notes: row.notes,
      reason: row.reason,
      actor: actorLabel(row.actor),
      recordedAt: row.recordedAt.toISOString(),
    })),
  };
}
