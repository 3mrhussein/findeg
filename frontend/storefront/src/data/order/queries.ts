import { getSession } from '@/lib/session';
import { createOrders } from '@findeg/orders';
import { createIdentityServices } from '@findeg/backend/features/identity';

/**
 * Checkout prefill data shape
 */
export interface CheckoutPrefillData {
  fullName: string;
  guestEmail: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  notes: string;
}

/**
 * Resolves checkout prefill from authenticated user session + last shipping address.
 */
export async function getCheckoutPrefill(): Promise<CheckoutPrefillData | null> {
  const session = await getSession();
  if (!session?.userId) return null;

  const [address, user] = await Promise.all([
    createOrders().latestShippingAddress(session.userId),
    createIdentityServices().userService.getProfile(session.userId),
  ]);

  return {
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || address?.fullName || '',
    guestEmail: user?.email ?? '',
    phone: user.phone || address?.phone || '',
    city: address?.city ?? '',
    area: address?.area ?? '',
    street: address?.street ?? '',
    building: address?.building ?? '',
    floor: address?.floor ?? '',
    apartment: address?.apartment ?? '',
    notes: address?.notes ?? '',
  };
}
