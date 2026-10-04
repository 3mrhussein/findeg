import type { RewardSalesRow } from '@findeg/db/queries/rewards';
import type { RewardAmount } from './monthly-statement';

export type ReportLocale = 'en' | 'ar';

/**
 * One row of the sales table: a month × list × list item × variant with the rewards earned and
 * reversed there. Names are live, in the viewer's locale, falling back to the other locale and
 * then to the `order_items` snapshot when the catalog row is gone.
 */
export interface SalesRowView {
  /** `YYYY-MM` in Cairo time. */
  readonly month: string;
  readonly listId: number | null;
  readonly listName: string | null;
  readonly listItemId: number | null;
  readonly listItemLabel: string | null;
  readonly variantId: number | null;
  readonly productName: string | null;
  readonly variantLabel: string | null;
  readonly earned: RewardAmount;
  readonly reversed: RewardAmount;
  /** Distinct Orders that contributed. Never an Order Reference. */
  readonly orderCount: number;
}

function localized(
  map: { en?: string; ar?: string } | null,
  locale: ReportLocale,
  snapshot: string | null = null,
) {
  const other = locale === 'en' ? 'ar' : 'en';
  return map?.[locale]?.trim() || map?.[other]?.trim() || snapshot;
}

export function toSalesRowView(row: RewardSalesRow, locale: ReportLocale): SalesRowView {
  return {
    month: row.month,
    listId: row.listId,
    listName: localized(row.listTitle, locale),
    listItemId: row.listItemId,
    listItemLabel: localized(row.listItemLabel, locale),
    variantId: row.variantId,
    productName: localized(row.productName, locale, row.productNameSnapshot),
    variantLabel: localized(row.variantLabel, locale, row.variantLabelSnapshot),
    earned: { points: row.earnedPoints, egpPiasters: row.earnedEgpPiasters },
    reversed: { points: row.reversedPoints, egpPiasters: row.reversedEgpPiasters },
    orderCount: row.orderCount,
  };
}
