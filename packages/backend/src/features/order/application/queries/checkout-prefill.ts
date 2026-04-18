import { createIdentityServices } from "@features/identity";
import { createOrderServices } from "../services/factory";
import type { SessionPayload } from "@features/core/domain/auth";
import { User, getUserFullName } from "@features/identity/domain/entities/User";
import type { Order } from "@features/order/domain/entities/Order";

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
  return getUserFullName({ firstName: user.firstName, lastName: user.lastName });
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
export async function getCheckoutPrefill(
  session: SessionPayload | null,
): Promise<CheckoutPrefillData | null> {
  const { orders } = createOrderServices();
  const { users } = createIdentityServices();

  if (!session?.userId) return null;

  const [user, orderList] = await Promise.all([
    users.getById(session.userId),
    orders.getByUserId(session.userId),
  ]);

  if (!user) return null;

  const latestOrder = getLatestOrder(orderList);
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
