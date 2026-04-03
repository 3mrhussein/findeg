import { getServices } from "@/server/getServices";
import { notFound, redirect } from "next/navigation";
import type { User } from "@/features/identity/domain/entities/User";
import type { Order } from "@/features/order/domain/entities/Order";

export interface MyAccountData {
  user: User;
  orders: Order[];
  userId: number;
}

/**
 * Resolves current authenticated user's account summary (profile + orders).
 * Redirects to registration when user is unauthenticated.
 */
export async function getMyAccountDataOrRedirect(): Promise<MyAccountData> {
  const { auth, repositories } = getServices();
  const session = await auth.getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const [user, orders] = await Promise.all([
    repositories.users.getById(session.userId),
    repositories.orders.getByUserId(session.userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  return {
    user,
    orders,
    userId: session.userId,
  };
}

/**
 * Resolves a user-owned order detail for the current authenticated user.
 */
export async function getMyOrderDetailOrNotFound(orderId: number) {
  const { repositories, auth } = getServices();
  const session = await auth.getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const order = await repositories.orders.getById(orderId);
  if (!order || order.userId !== session.userId) {
    notFound();
  }

  return order;
}
