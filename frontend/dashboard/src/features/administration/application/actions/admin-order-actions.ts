"use server";

import { updateTag } from "next/cache";
import { createAdministrationServices } from "@findeg/backend/features/administration";
import { getErrorMessage } from "@lib/type-guards";

/**
 * Admin Order Actions (Dashboard Data Layer)
 *
 * Uses "use server" directive and calls backend service factories.
 * Implements cache invalidation via updateTag() for immediate consistency.
 */

export async function adminUpdateOrderStatusAction(
  orderId: number,
  status: string,
  trackingNumber?: string,
  adminNotes?: string,
) {
  try {
    const { orders } = createAdministrationServices();
    await orders.updateStatus(orderId, {
      status: status as any,
      trackingNumber,
      adminNotes,
    });

    updateTag("orders");
    return { success: true };
  } catch (error: unknown) {
    console.error("[adminUpdateOrderStatusAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminUpdatePaymentStatusAction(orderId: number, status: string) {
  try {
    const { orders } = createAdministrationServices();
    await orders.updatePaymentStatus(orderId, status as any);

    updateTag("orders");
    return { success: true };
  } catch (error: unknown) {
    console.error("[adminUpdatePaymentStatusAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminCancelOrderAction(orderId: number, reason: string) {
  try {
    const { orders } = createAdministrationServices();
    await orders.updateStatus(orderId, {
      status: "cancelled" as any,
      adminNotes: reason,
    });

    updateTag("orders");
    return { success: true };
  } catch (error: unknown) {
    console.error("[adminCancelOrderAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function adminUpdateOrderPaymentStatusAction(orderId: number, status: string) {
  try {
    const { orders } = createAdministrationServices();
    await orders.updatePaymentStatus(orderId, status as any);

    updateTag("orders");
    return { success: true };
  } catch (error: unknown) {
    console.error("[adminUpdateOrderPaymentStatusAction]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
