/**
 * Cart Retrieval Endpoint
 *
 * GET /api/v1/cart
 * Retrieves the current user's cart (authenticated or guest).
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../_lib/api-response";
import { withOptionalAuth } from "../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 * Get cart
 *
 * @param request - Request with Authorization header (optional for guests)
 * @returns Cart with items, subtotal, item count
 */
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (context) => {
    try {
      const { cartService } = getServices();

      // Determine cart identifier (userId or guestId)
      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.getCart(cartId);

      return apiResponse({
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          itemCount: cart.itemCount,
        },
      });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to retrieve cart", 500);
    }
  });
}
