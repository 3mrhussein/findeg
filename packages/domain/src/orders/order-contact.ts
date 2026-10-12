import { z } from 'zod';
import { GOVERNORATES, type Governorate } from '../common';
import type { CustomerId } from '../customers';
import { OrderError } from './order-error';

declare const mobile: unique symbol;

/**
 * An Egyptian mobile number, required on every Order so Staff can confirm it by phone (CO-18):
 * `01` then 0, 1, 2 or 5 and eight digits, written locally (`010…`) or internationally
 * (`+2010…`).
 */
export type EgyptianMobile = string & { readonly [mobile]: 'EgyptianMobile' };

export const EGYPTIAN_MOBILE_PATTERN = /^(?:\+20|0)1[0125]\d{8}$/;

/** An Egyptian mobile from text, refused unless it matches `EGYPTIAN_MOBILE_PATTERN` exactly. */
export function egyptianMobile(text: string): EgyptianMobile {
  if (typeof text !== 'string') {
    throw new TypeError(`Expected a phone number string, received ${typeof text}`);
  }
  if (!EGYPTIAN_MOBILE_PATTERN.test(text)) {
    throw new OrderError(
      'INVALID_PHONE',
      `Invalid Egyptian mobile ${JSON.stringify(text)}: expected 01X… or +201X… with X one of 0, 1, 2 or 5`,
    );
  }
  return text as EgyptianMobile;
}

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

const ShippingAddressSchema = z.object({
  fullName: z.string().min(2),
  governorate: z.enum(GOVERNORATES),
  city: z.string().min(2),
  area: z.string().min(2),
  street: z.string().min(2),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * A shipping address: a name, city, area and street of at least two characters each, in one of
 * the 27 governorates, with optional building, floor, apartment and notes.
 */
export function shippingAddress(
  address: Omit<ShippingAddress, 'governorate'> & { governorate: string },
): ShippingAddress {
  const parsed = ShippingAddressSchema.safeParse(address);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
    throw new OrderError(
      'INVALID_SHIPPING_ADDRESS',
      `Invalid shipping address: check ${fields.join(', ')}`,
    );
  }
  return parsed.data;
}

/** Who places an Order: a Customer account, or a guest who must give an email. */
export type OrderBuyer =
  { kind: 'customer'; customerId: CustomerId } | { kind: 'guest'; email: string };

const GUEST_EMAIL = z.string().trim().toLowerCase().pipe(z.email().max(255));

/** A guest buyer. The email is trimmed and lower-cased, and must be a valid address. */
export function guestBuyer(email: string): OrderBuyer {
  const parsed = GUEST_EMAIL.safeParse(email);
  if (!parsed.success) {
    throw new OrderError('INVALID_GUEST_EMAIL', `Invalid guest email ${JSON.stringify(email)}`);
  }
  return { kind: 'guest', email: parsed.data };
}
