import { getServices } from "@/server/getServices";
import type { User } from "@/features/identity/domain/entities/User";
import type { Order } from "@/features/order/domain/entities/Order";

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
 * Safely composes a display full name from user fields.
 */
function resolveFullName(user: User): string {
  const fromParts = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (fromParts) return fromParts;
  if (user.name) return user.name;
  return "";
}

/**
 * Picks the most recent order by createdAt timestamp.
 */
function getLatestOrder(orders: Order[]): Order | undefined {
  return [...orders].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  })[0];
}

/**
 * Resolves checkout prefill from authenticated user profile + last shipping address.
 */
export async function getCheckoutPrefill(): Promise<CheckoutPrefillData | null> {
  const { auth, repositories } = getServices();
  const session = await auth.getSession();

  if (!session?.userId) return null;

  const [user, orders] = await Promise.all([
    repositories.users.getById(session.userId),
    repositories.orders.getByUserId(session.userId),
  ]);

  if (!user) return null;

  const latestOrder = getLatestOrder(orders);
  const address = latestOrder?.shippingAddressSnapshot;

  return {
    fullName: resolveFullName(user) || address?.fullName || "",
    guestEmail: user.email ?? "",
    phone: user.phone ?? address?.phone ?? "",
    city: address?.city ?? "",
    area: address?.area ?? "",
    street: address?.street ?? "",
    building: address?.building ?? "",
    floor: address?.floor ?? "",
    apartment: address?.apartment ?? "",
    notes: address?.notes ?? "",
  };
}
