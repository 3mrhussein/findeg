import {
  piastersToEgp,
  sumSalesFigures,
  type StaffPartnerReportView,
} from '@findeg/backend/features/partner-sales';

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
  const total = sumSalesFigures(report.sales);
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
      egp: piastersToEgp(row.chargedPiasters),
      orderCount: row.orderCount,
    })),
    total: {
      quantity: total.quantity,
      egp: piastersToEgp(total.chargedPiasters),
    },
  };
}
