import { z } from 'zod';
import { GOVERNORATES } from '../../../common';
import { OrderError } from '../../helpers';
import { EGYPTIAN_MOBILE_PATTERN } from './constants';
import type { EgyptianMobile, OrderBuyer, ShippingAddress } from './types';

const shippingAddressSchema = z.object({
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

const GUEST_EMAIL = z.string().trim().toLowerCase().pipe(z.email().max(255));

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

/**
 * A shipping address: a name, city, area and street of at least two characters each, in one of
 * the 27 governorates, with optional building, floor, apartment and notes.
 */
export function shippingAddress(
  address: Omit<ShippingAddress, 'governorate'> & { governorate: string },
): ShippingAddress {
  const parsed = shippingAddressSchema.safeParse(address);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
    throw new OrderError(
      'INVALID_SHIPPING_ADDRESS',
      `Invalid shipping address: check ${fields.join(', ')}`,
    );
  }
  return parsed.data;
}

/** A guest buyer. The email is trimmed and lower-cased, and must be a valid address. */
export function guestBuyer(email: string): OrderBuyer {
  const parsed = GUEST_EMAIL.safeParse(email);
  if (!parsed.success) {
    throw new OrderError('INVALID_GUEST_EMAIL', `Invalid guest email ${JSON.stringify(email)}`);
  }
  return { kind: 'guest', email: parsed.data };
}
