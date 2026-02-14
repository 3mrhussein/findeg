/**
 * Cart Item Management Endpoint
 *
 * POST /api/v1/cart/items
 * Adds an item to the cart.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withOptionalAuth } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 * Add item to cart
 *
 * @param request - Request with JSON body: { productId, quantity, variant? }
 * @returns Updated cart
 */
export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async (context) => {
    try {
      const body = await request.json();
      const { productId, quantity, variant } = body;

      // Validation
      if (!productId || !quantity) {
        return apiError("productId and quantity are required", 400);
      }

      if (quantity < 1) {
        return apiError("Quantity must be at least 1", 400);
      }

      const { cartService, productService } = getServices();

      // Verify product exists and has stock
      const product = await productService.getById(productId);
      if (!product) {
        return apiError("Product not found", 404);
      }

      if (product.stockQuantity !== undefined && product.stockQuantity < quantity) {
        return apiError(`Insufficient stock. Available: ${product.stockQuantity}`, 400);
      }

      // Determine cart identifier
      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.addItem(cartId, {
        productId,
        quantity,
        variant,
      });

      return apiResponse(
        {
          cart: {
            items: cart.items,
            subtotal: cart.subtotal,
            itemCount: cart.itemCount,
          },
        },
        201,
      );
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to add item to cart", 500);
    }
  });
}
