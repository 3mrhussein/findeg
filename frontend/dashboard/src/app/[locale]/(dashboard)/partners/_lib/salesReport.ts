import type { StaffPartnerReportView } from '@findeg/backend/features/partner-sales';

/** Exact piasters as EGP text, never through a JS number. */
export function formatEgp(piasters: bigint): string {
  return `${piasters / 100n}.${(piasters % 100n).toString().padStart(2, '0')}`;
}

export interface SalesReportProps {
  readonly asOf: string;
  readonly month: string;
  readonly months: readonly string[];
  readonly sales: readonly {
    readonly key: string;
    readonly listName: string | null;
    readonly listItemLabel: string | null;
    readonly productName: string | null;
    readonly variantLabel: string | null;
    readonly quantity: number;
    readonly egp: string;
    readonly orderCount: number;
  }[];
  readonly total: { readonly quantity: number; readonly egp: string };
}

/** Serializable props for the Sales tab. Bigints never cross the server/client boundary. */
export function toSalesReportProps(report: StaffPartnerReportView): SalesReportProps {
  return {
    asOf: report.asOf.toISOString(),
    month: report.month,
    months: report.months,
    sales: report.sales.map((row, index) => ({
      key: `${index}-${row.listId}-${row.listItemId}-${row.variantId}`,
      listName: row.listName,
      listItemLabel: row.listItemLabel,
      productName: row.productName,
      variantLabel: row.variantLabel,
      quantity: row.quantity,
      egp: formatEgp(row.chargedPiasters),
      orderCount: row.orderCount,
    })),
    total: {
      quantity: report.sales.reduce((sum, row) => sum + row.quantity, 0),
      egp: formatEgp(report.sales.reduce((sum, row) => sum + row.chargedPiasters, 0n)),
    },
  };
}
