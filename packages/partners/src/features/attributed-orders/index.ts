import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import {
  getAttributedOrderTotals,
  listAttributedOrders,
  type AttributedOrderRow,
  type AttributedOrderTotalsRow,
  type PartnerSalesDatabase,
} from '@findeg/db/queries/partner-sales';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from '@findeg/domain';
import {
  canViewPartnerReports,
  fail,
  ok,
  READ_SNAPSHOT,
  type PartnerSalesResult,
  type PartnerSalesStaffActor,
} from '../../helpers/access/index';
import { BUSINESS_TIME_ZONE } from '@findeg/domain';
import { isDateKey } from '../../helpers/time/index';

export type AttributedOrderStatus = OrderStatus;
export type AttributedPaymentStatus = PaymentStatus;

export interface AttributedOrdersFilter {
  /** First day, `YYYY-MM-DD` in Cairo time, inclusive. */
  readonly from: string;
  /** Last day, `YYYY-MM-DD` in Cairo time, inclusive. */
  readonly to: string;
  /** Omitted: every order status. */
  readonly orderStatuses?: readonly AttributedOrderStatus[];
  /** Omitted: every payment status. */
  readonly paymentStatuses?: readonly AttributedPaymentStatus[];
}

/** An Attributed Order with its money in piasters. Charged excludes shipping. */
export type AttributedOrderView = AttributedOrderRow;
export type AttributedOrderTotals = AttributedOrderTotalsRow;

export interface AttributedOrdersView {
  readonly orders: readonly AttributedOrderView[];
  readonly totals: AttributedOrderTotals;
}

export type AttributedOrdersError = 'forbidden' | 'invalid-input' | 'not-found';

export interface IAttributedOrderService {
  /**
   * A Business Partner's Attributed Orders accepted within a Cairo-time date period, oldest
   * first, with their totals. The inputs any future rewards calculation starts from (ADR-0013).
   */
  getAttributedOrders(
    actor: PartnerSalesStaffActor,
    businessPartnerId: number,
    filter: AttributedOrdersFilter,
  ): Promise<PartnerSalesResult<AttributedOrdersView, AttributedOrdersError>>;
}

const isStatusList = (values: unknown, allowed: readonly string[]) =>
  values === undefined ||
  (Array.isArray(values) &&
    values.length > 0 &&
    values.every((value) => typeof value === 'string' && allowed.includes(value)));

export function isValidAttributedOrdersFilter(filter: AttributedOrdersFilter): boolean {
  return (
    isDateKey(filter.from) &&
    isDateKey(filter.to) &&
    filter.from <= filter.to &&
    isStatusList(filter.orderStatuses, ORDER_STATUSES) &&
    isStatusList(filter.paymentStatuses, PAYMENT_STATUSES)
  );
}

export class AttributedOrderService implements IAttributedOrderService {
  constructor(private readonly getDb: () => Promise<PartnerSalesDatabase>) {}

  async getAttributedOrders(
    actor: PartnerSalesStaffActor,
    businessPartnerId: number,
    filter: AttributedOrdersFilter,
  ) {
    if (!canViewPartnerReports(actor)) return fail('forbidden');
    if (!isValidAttributedOrdersFilter(filter)) return fail('invalid-input');

    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');

    const query = {
      businessPartnerId,
      from: filter.from,
      to: filter.to,
      timeZone: BUSINESS_TIME_ZONE,
      orderStatuses: filter.orderStatuses,
      paymentStatuses: filter.paymentStatuses,
    };
    // One snapshot, so the totals always add up to the listed orders.
    return db.transaction(async (tx) => {
      const [orders, totals] = await Promise.all([
        listAttributedOrders(tx, query),
        getAttributedOrderTotals(tx, query),
      ]);
      return ok({ orders, totals });
    }, READ_SNAPSHOT);
  }
}
