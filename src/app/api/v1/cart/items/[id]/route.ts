/**
 * Cart Item Update/Delete Endpoint
 *
 * PUT /api/v1/cart/items/[id] - Update item quantity
 * DELETE /api/v1/cart/items/[id] - Remove item from cart
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withOptionalAuth } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 * Update cart item quantity
 *
 * @param request - Request with JSON body: { quantity }
 * @param params - Route params: { id }
 * @returns Updated cart
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withOptionalAuth(request, async (context) => {
    try {
      const body = await request.json();
      const { quantity } = body;
      const { id: idParam } = await params;
      const itemId = parseInt(idParam);

      if (!quantity || quantity < 1) {
        return apiError("Quantity must be at least 1", 400);
      }

      const { cartService } = getServices();

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.updateItemQuantity(cartId, itemId, quantity);

      return apiResponse({
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          itemCount: cart.itemCount,
        },
      });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to update cart item", 500);
    }
  });
}

/**
 * Remove item from cart
 *
 * @param request - Request object
 * @param params - Route params: { id }
 * @returns Updated cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withOptionalAuth(request, async (context) => {
    try {
      const { id: idParam } = await params;
      const itemId = parseInt(idParam);
      const { cartService } = getServices();

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.removeItem(cartId, itemId);

      return apiResponse({
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          itemCount: cart.itemCount,
        },
      });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to remove cart item", 500);
    }
  });
}
