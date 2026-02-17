/**
 * Order Creation Endpoint
 *
 * POST /api/v1/checkout/order
 * Creates an order from the current cart.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { withOptionalAuth } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { CheckoutOrderSchema } from "@/features/order/domain/schemas";
import { API_SUCCESS_MESSAGES, DOMAIN_DEFAULTS } from "@/features/core/domain/constants/messages";
import { validateWithResult } from "@/features/core/domain/errors";

/**
 * Create order
 *
 * @param request - Request with JSON body: { address, paymentMethod, guestEmail? }
 * @returns Order confirmation with tracking
 */
export async function POST(request: NextRequest) {
  return withOptionalAuth(request, async (context) => {
    try {
      const body = await request.json();

      // Guest checkout requires guestEmail
      const parsed = validateWithResult(CheckoutOrderSchema, body);
      if (!parsed.ok) {
        return apiErrorByCode(parsed.error.code, parsed.error.details);
      }

      const { address, paymentMethod, guestEmail } = parsed.value;

      if (!context.user && !guestEmail) {
        return apiErrorByCode("CHECKOUT_GUEST_EMAIL_REQUIRED");
      }

      const { cartService, productService, repositories } = getServices();

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.getCart(cartId);

      if (!cart.items || cart.items.length === 0) {
        return apiErrorByCode("CART_EMPTY");
      }

      const subtotal = cart.items.reduce((acc, item) => {
        const unitPrice = item.unitPriceSnapshot ?? 0;
        return acc + unitPrice * item.quantity;
      }, 0);
      const shippingCost = paymentMethod === "cod" ? 50 : 30; // EGP
      const totalAmount = subtotal + shippingCost;

      // Create order items with snapshots
      const orderItems = await Promise.all(
        cart.items.map(async (item) => {
          const product = await productService.getById(item.id);
          const unitPriceSnapshot = item.unitPriceSnapshot ?? product?.price ?? 0;
          return {
            productId: item.id,
            quantity: item.quantity,
            productNameSnapshot: product?.name || DOMAIN_DEFAULTS.PRODUCT_NAME_FALLBACK,
            productSkuSnapshot: product?.sku || "",
            unitPriceSnapshot,
            variantSnapshot: {
              ...(item.variant || {}),
              variantKey: item.variantKey || DOMAIN_DEFAULTS.VARIANT_KEY,
              uomCode: item.uomCode || DOMAIN_DEFAULTS.UOM_CODE,
              customerGroup: item.customerGroup || DOMAIN_DEFAULTS.CUSTOMER_GROUP,
            },
            totalPrice: unitPriceSnapshot * item.quantity,
            priceAtTime: unitPriceSnapshot,
          };
        }),
      );

      // Persist order with snapshots
      const order = await repositories.orders.create({
        userId: context.user?.userId,
        guestEmail: !context.user ? guestEmail : undefined,
        status: "pending",
        paymentStatus: "unpaid",
        subtotal,
        shippingCost,
        totalAmount,
        currency: DOMAIN_DEFAULTS.CURRENCY,
        paymentMethod,
        shippingAddressSnapshot: address,
        items: orderItems,
      });

      // Clear cart after order creation
      await cartService.clearCart(cartId);

      return apiResponse(
        {
          order: {
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            currency: order.currency,
            items: order.items || [],
            shippingAddress: order.shippingAddressSnapshot,
            createdAt: order.createdAt,
          },
          message: API_SUCCESS_MESSAGES.ORDER_CREATED,
        },
        201,
      );
    } catch (error) {
      return apiErrorByCode("CHECKOUT_CREATE_ORDER_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}
