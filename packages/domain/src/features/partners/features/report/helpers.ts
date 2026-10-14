import { ZERO_MONEY, addMoney, type Money } from '../../../common';
import type { VariantId } from '../../../catalog';
import type { SupplyListId, SupplyListItemId } from '../../../school-lists';
import { PARTNER_REPORT_MIN_ORDERS } from '../../constants';

/**
 * The grain of a Partner Report row (ADR-0010, PA-14): one Cairo month × School Supply List ×
 * list item × variant. Only live Orders (`LIVE_ORDER_STATUSES`) count, each in the Cairo month
 * (`businessMonthOf`) it was accepted. The read side tallies rows at this grain.
 */
export interface PartnerReportRowKey {
  /** `YYYY-MM` in Cairo time. */
  month: string;
  supplyListId: SupplyListId;
  supplyListItemId: SupplyListItemId;
  variantId: VariantId;
}

/** Units sold and the amount charged for them: post-discount line totals, without shipping. */
export interface PartnerSalesFigures {
  quantity: number;
  charged: Money;
}

/** A tallied sales row with the number of distinct Orders behind it, which no Partner sees. */
export interface PartnerSalesTally extends PartnerSalesFigures {
  distinctOrders: number;
}

/** The Partner Report a Business Partner sees: no Order count anywhere. */
export interface PartnerReport<Row> {
  rows: Row[];
  /** The rows rolled up for having too few Orders; `null` when none were. */
  otherItems: PartnerSalesFigures | null;
}

/**
 * Applies the Partner Report's privacy rule (ADR-0010, PA-14): a row built from fewer than
 * `PARTNER_REPORT_MIN_ORDERS` distinct Orders is folded into "Other items", so totals still add
 * up. Shown rows keep their order and lose their Order count.
 */
export function rollUpPartnerReport<Row extends PartnerSalesTally>(
  tallies: readonly Row[],
): PartnerReport<Omit<Row, 'distinctOrders'>> {
  const rows: Omit<Row, 'distinctOrders'>[] = [];
  let otherItems: PartnerSalesFigures | null = null;
  for (const { distinctOrders, ...shown } of tallies) {
    if (distinctOrders >= PARTNER_REPORT_MIN_ORDERS) {
      rows.push(shown);
    } else {
      otherItems = addFigures(otherItems ?? NO_SALES, shown);
    }
  }
  return { rows, otherItems };
}

/** The report's totals: every shown row plus Other items. */
export function partnerReportTotals(
  report: PartnerReport<PartnerSalesFigures>,
): PartnerSalesFigures {
  const shown = report.rows.reduce(addFigures, NO_SALES);
  return report.otherItems ? addFigures(shown, report.otherItems) : shown;
}

const NO_SALES: PartnerSalesFigures = { quantity: 0, charged: ZERO_MONEY };

function addFigures(total: PartnerSalesFigures, row: PartnerSalesFigures): PartnerSalesFigures {
  return { quantity: total.quantity + row.quantity, charged: addMoney(total.charged, row.charged) };
}
