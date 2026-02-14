/**
 * Order Creation Endpoint
 *
 * POST /api/v1/checkout/order
 * Creates an order from the current cart.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withOptionalAuth } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";

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
      const { address, paymentMethod, guestEmail } = body;

      // Validation
      if (!address || !address.city || !address.street || !address.fullName || !address.phone) {
        return apiError("Complete address with name and phone is required", 400);
      }

      if (!paymentMethod) {
        return apiError("Payment method is required", 400);
      }

      if (!context.user && !guestEmail) {
        return apiError("Guest email is required for guest checkout", 400);
      }

      const { cartService, productService } = getServices();

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.getCart(cartId);

      if (!cart.items || cart.items.length === 0) {
        return apiError("Cart is empty", 400);
      }

      // Calculate totals
      const subtotal = cart.subtotal || 0;
      const shippingCost = paymentMethod === "cod" ? 50 : 30; // EGP
      const totalAmount = subtotal + shippingCost;

      // Create order items with snapshots
      const orderItems = await Promise.all(
        cart.items.map(async (item: any) => {
          const product = await productService.getById(item.id);
          return {
            productId: item.id,
            quantity: item.quantity,
            productNameSnapshot: product?.name || "Unknown Product",
            productSkuSnapshot: product?.sku || "",
            unitPriceSnapshot: product?.price || 0,
            variantSnapshot: item.variant || {},
            totalPrice: (product?.price || 0) * item.quantity,
          };
        }),
      );

      // Create order (placeholder - needs actual order repository method)
      const order = {
        id: Math.floor(Math.random() * 100000), // Temporary - should come from DB
        userId: context.user?.userId,
        guestEmail: !context.user ? guestEmail : undefined,
        status: "pending",
        paymentStatus: "unpaid",
        subtotal,
        shippingCost,
        totalAmount,
        currency: "EGP",
        paymentMethod,
        shippingAddressSnapshot: address,
        items: orderItems,
        createdAt: new Date(),
      };

      // Clear cart after order creation
      await cartService.clearCart(cartId);

      return apiResponse(
        {
          order: {
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            currency: order.currency,
            items: order.items,
            shippingAddress: order.shippingAddressSnapshot,
            createdAt: order.createdAt,
          },
          message: "Order created successfully",
        },
        201,
      );
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to create order", 500);
    }
  });
}
