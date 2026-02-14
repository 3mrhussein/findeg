/**
 * Checkout Validation Endpoint
 *
 * POST /api/v1/checkout/validate
 * Validates cart and address before order creation.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withOptionalAuth } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 * Validate checkout
 *
 * @param request - Request with JSON body: { address, paymentMethod }
 * @returns Validation result with totals
 */
export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async (context) => {
    try {
      const body = await request.json();
      const { address, paymentMethod } = body;

      // Validation
      if (!address || !address.city || !address.street) {
        return apiError("Complete address is required", 400);
      }

      if (!paymentMethod) {
        return apiError("Payment method is required", 400);
      }

      const { cartService, productService } = getServices();

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.getCart(cartId);

      if (!cart.items || cart.items.length === 0) {
        return apiError("Cart is empty", 400);
      }

      // Validate stock for all items
      const stockIssues: string[] = [];
      for (const item of cart.items) {
        const product = await productService.getById(item.id);
        if (!product) {
          stockIssues.push(`Product ${item.id} not found`);
          continue;
        }
        if (product.stockQuantity !== undefined && product.stockQuantity < item.quantity) {
          stockIssues.push(
            `${product.name}: Only ${product.stockQuantity} available (requested ${item.quantity})`,
          );
        }
      }

      if (stockIssues.length > 0) {
        return apiError("Stock validation failed", 400, { stockIssues });
      }

      // Calculate totals
      const subtotal = cart.subtotal || 0;
      const shippingCost = paymentMethod === "cod" ? 50 : 30; // EGP
      const total = subtotal + shippingCost;

      return apiResponse({
        valid: true,
        totals: {
          subtotal,
          shippingCost,
          total,
          currency: "EGP",
        },
      });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Validation failed", 500);
    }
  });
}
