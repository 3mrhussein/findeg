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
      const { cartService, productService } = getServices();

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.getCart(cartId);

      if (!cart.items || cart.items.length === 0) {
        return apiErrorByCode("CART_EMPTY");
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
        return apiErrorByCode("CART_INSUFFICIENT_STOCK", { stockIssues });
      }

      const computedSubtotal = cart.items.reduce((acc, item) => {
        const unitPrice = item.unitPriceSnapshot ?? 0;
        return acc + unitPrice * item.quantity;
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
