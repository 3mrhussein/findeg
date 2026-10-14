import type { StockAllocation, StockBalance, Warehouse } from '../../../inventory';
import type { AcceptedOrder } from '../../types';
import type { ConfirmationTerms } from '../confirmation';
import type { EgyptianMobile, OrderBuyer, ShippingAddress } from '../order-contact';
import type { OrderReference } from '../order-reference';
import type { Quote } from '../quote';

/** What Order Acceptance needs: the buyer's details, the fresh Quote and its confirmation, and the stock. */
export interface OrderAcceptanceRequest {
  reference: OrderReference;
  buyer: OrderBuyer;
  contactPhone: EgyptianMobile;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  /** The Order priced again at acceptance, never the client's copy. */
  quote: Quote;
  /** The confirmation the Customer gave for the terms they saw. */
  confirmation: string;
  /** Checkout's digest of Confirmation terms. */
  digestTerms: (terms: ConfirmationTerms) => string;
  /** The stock of the Order's variants, read under lock. */
  stock: { balances: readonly StockBalance[]; warehouses: readonly Warehouse[] };
}

/** An accepted Order and the stock to hold for it. */
export interface OrderAcceptance {
  order: AcceptedOrder;
  /** Add the stored Order's id to each to make its Stock Reservations. */
  stock: StockAllocation[];
}
