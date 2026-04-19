import { getSession } from "@/lib/session";
import { createOrderServices } from "@backend/features/order";

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

  const { orders } = createOrderServices();

  // Fetch user's orders to get the latest shipping address
  // Note: We're using the session user data for initial prefill
  const userOrders = await orders.getByUserId(Number(session.userId));

  // Sort by date manually if the service doesn't
  const latestOrder = [...userOrders].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  })[0];

  const address = latestOrder?.shippingAddressSnapshot;
  const user = session.user;

  return {
    fullName:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : address?.fullName || "",
    guestEmail: user?.email ?? "",
    phone: address?.phone ?? "",
    city: address?.city ?? "",
    area: address?.area ?? "",
    street: address?.street ?? "",
    building: address?.building ?? "",
    floor: address?.floor ?? "",
    apartment: address?.apartment ?? "",
    notes: address?.notes ?? "",
  };
}
