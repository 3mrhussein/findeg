import {
  piastersToEgp,
  sumSalesFigures,
  type PartnerReportView,
} from '@findeg/backend/features/partner-sales';

export interface SalesFigureProps {
  readonly quantity: number;
  readonly egp: string;
}

export interface PartnerReportProps {
  /** Cairo-time, localized. Shown as "as of". */
  readonly asOf: string;
  readonly month: string;
  readonly monthLabel: string;
  /** The month picker: `value` is `YYYY-MM`, `label` is localized. */
  readonly months: readonly { readonly value: string; readonly label: string }[];
  readonly sales: readonly (SalesFigureProps & {
    readonly key: string;
    readonly listName: string | null;
    readonly listItemLabel: string | null;
    readonly productName: string | null;
    readonly variantLabel: string | null;
  })[];
  readonly otherItems: SalesFigureProps | null;
  /** Shown rows plus Other items. */
  readonly total: SalesFigureProps;
}

/** Serializable props for the Reports page. Bigints never cross the server/client boundary. */
export function toPartnerReportProps(
  report: PartnerReportView,
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
  const rows = [...report.sales, ...(report.otherItems ? [report.otherItems] : [])];
  const total = sumSalesFigures(rows);
  return {
    asOf: dateTime.format(report.asOf),
    month: report.month,
    monthLabel: monthLabel(report.month),
    months: report.months.map((value) => ({ value, label: monthLabel(value) })),
    sales: report.sales.map((row, index) => ({
      key: String(index),
      listName: row.listName,
      listItemLabel: row.listItemLabel,
      productName: row.productName,
      variantLabel: row.variantLabel,
      quantity: row.quantity,
      egp: piastersToEgp(row.chargedPiasters),
    })),
    otherItems: report.otherItems
      ? {
          quantity: report.otherItems.quantity,
          egp: piastersToEgp(report.otherItems.chargedPiasters),
        }
      : null,
    total: {
      quantity: total.quantity,
      egp: piastersToEgp(total.chargedPiasters),
    },
  };
}
