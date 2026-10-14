import type { Governorate } from '../../../common';
import type { CustomerId } from '../../../customers';

declare const mobile: unique symbol;

/**
 * An Egyptian mobile number, required on every Order so Staff can confirm it by phone (CO-18):
 * `01` then 0, 1, 2 or 5 and eight digits, written locally (`010…`) or internationally
 * (`+2010…`).
 */
export type EgyptianMobile = string & { readonly [mobile]: 'EgyptianMobile' };

/** Where an Order is delivered. The contact phone is the Order's, not the address's. */
export interface ShippingAddress {
  fullName: string;
  governorate: Governorate;
  city: string;
  area: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
}

/** Who places an Order: a Customer account, or a guest who must give an email. */
export type OrderBuyer =
  { kind: 'customer'; customerId: CustomerId } | { kind: 'guest'; email: string };
