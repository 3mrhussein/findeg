import { getSession } from '@/lib/session';
import { createOrders } from '@findeg/backend/features/order';

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

  const address = await createOrders().latestShippingAddress(Number(session.userId));
  const user = session.user;

  return {
    fullName:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : address?.fullName || '',
    guestEmail: user?.email ?? '',
    phone: address?.phone ?? '',
    city: address?.city ?? '',
    area: address?.area ?? '',
    street: address?.street ?? '',
    building: address?.building ?? '',
    floor: address?.floor ?? '',
    apartment: address?.apartment ?? '',
    notes: address?.notes ?? '',
  };
}
