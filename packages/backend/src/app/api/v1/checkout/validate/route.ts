/**
 * Checkout Validation Endpoint
 *
 * POST /api/v1/checkout/validate
 * Validates cart and address before order creation.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { withOptionalAuth } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { CheckoutValidateSchema } from "@/features/order/domain/schemas";
import { DOMAIN_DEFAULTS } from "@/features/core/domain/constants/messages";

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
      const parseResult = CheckoutValidateSchema.safeParse(body);

      if (!parseResult.success) {
        return apiErrorByCode("VALIDATION_INVALID_REQUEST", {
          issues: parseResult.error.issues,
        });
      }

      const { address, paymentMethod } = parseResult.data;
      const cartService = getServices().cart;

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.getCart(cartId);

      if (!cart.items || cart.items.length === 0) {
        return apiErrorByCode("CART_EMPTY");
      }

      // Compute subtotal from new CartItem shape (unitPrice × quantity)
      const computedSubtotal = cart.items.reduce((acc, item) => {
        return acc + item.unitPrice * item.quantity;
      }, 0);

      // Calculate totals (cod=50 EGP, card=30 EGP)
      const subtotal = computedSubtotal || cart.subtotal || 0;
      const shippingCost = paymentMethod === "cod" ? 50 : 30; // EGP
      const total = subtotal + shippingCost;

      return apiResponse({
        valid: true,
        totals: {
          subtotal,
          shippingCost,
          total,
          currency: DOMAIN_DEFAULTS.CURRENCY,
        },
      });
    } catch (error) {
      return apiErrorByCode("CHECKOUT_VALIDATE_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}
