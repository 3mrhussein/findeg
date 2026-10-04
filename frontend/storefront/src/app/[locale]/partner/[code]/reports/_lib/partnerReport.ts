import type { PartnerRewardReportView } from '@findeg/backend/features/partner-rewards';

const MINUS = '−';

/** Exact signed piasters as `-`-free EGP text with a typographic minus, never through a JS number. */
export function formatEgp(piasters: bigint): string {
  const sign = piasters < 0n ? MINUS : '';
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

export interface PartnerReportProps {
  /** Cairo-time, localized. Shown as "as of". */
  readonly asOf: string;
  readonly month: string;
  readonly monthLabel: string;
  /** The month picker: `value` is `YYYY-MM`, `label` is localized. */
  readonly months: readonly { readonly value: string; readonly label: string }[];
  readonly statement: {
    readonly openingEgp: string;
    readonly earned: AmountProps;
    readonly reversed: AmountProps;
    readonly adjustmentsEgp: string;
    readonly settledEgp: string;
    readonly closingEgp: string;
  };
  readonly pending: AmountProps;
  readonly availableBalanceEgp: string;
  /** Shows the fixed negative-balance explanation. */
  readonly balanceIsNegative: boolean;
  readonly sales: readonly {
    readonly key: string;
    readonly listName: string | null;
    readonly listItemLabel: string | null;
    readonly productName: string | null;
    readonly variantLabel: string | null;
    readonly earned: AmountProps;
    readonly reversed: AmountProps;
  }[];
  readonly otherItems: { readonly earned: AmountProps; readonly reversed: AmountProps } | null;
  readonly settlements: readonly {
    readonly id: number;
    readonly voided: boolean;
    /** For a void: the transfer reference of the payout it voids. */
    readonly voidsReference: string | null;
    readonly egp: string;
    readonly transferReference: string | null;
    readonly paidAt: string | null;
    readonly recordedAt: string;
  }[];
}

/** Serializable props for the Reports page. Bigints never cross the server/client boundary. */
export function toPartnerReportProps(
  report: PartnerRewardReportView,
  locale: string,
): PartnerReportProps {
  const dateTime = new Intl.DateTimeFormat(locale, {
    timeZone: 'Africa/Cairo',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const monthName = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const monthLabel = (key: string) => monthName.format(new Date(`${key}-01T00:00:00Z`));
  const { statement } = report;
  return {
    asOf: dateTime.format(report.asOf),
    month: statement.month,
    monthLabel: monthLabel(statement.month),
    months: report.months.map((value) => ({ value, label: monthLabel(value) })),
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
    balanceIsNegative: report.availableBalanceEgpPiasters < 0n || statement.closingEgpPiasters < 0n,
    sales: report.sales.map((row, index) => ({
      key: String(index),
      listName: row.listName,
      listItemLabel: row.listItemLabel,
      productName: row.productName,
      variantLabel: row.variantLabel,
      earned: amount(row.earned),
      reversed: amount(row.reversed),
    })),
    otherItems: report.otherItems
      ? { earned: amount(report.otherItems.earned), reversed: amount(report.otherItems.reversed) }
      : null,
    settlements: report.settlements.map((line) => ({
      id: line.id,
      voided: line.kind === 'void',
      voidsReference: line.voidsTransferReference,
      egp: formatEgp(line.amountPiasters),
      transferReference: line.transferReference,
      paidAt: line.paidAt,
      recordedAt: dateTime.format(line.recordedAt),
    })),
  };
}
