/**
 * Cart Item Update/Delete Endpoint
 *
 * PUT /api/v1/cart/items/[id] - Update item quantity
 * DELETE /api/v1/cart/items/[id] - Remove item from cart
 *
 * The route param `[id]` is the variantId.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse, apiErrorByCode } from "../../../_lib/api-response";
import { withOptionalAuth } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { CustomerGroupSchema, UomCodeSchema } from "@/features/core/domain/types/common";

const UpdateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  uomCode: UomCodeSchema.optional(),
  customerGroup: CustomerGroupSchema.optional(),
});

/**
 * Update cart item quantity
 *
 * @param request - Request with JSON body: { quantity }
 * @param params - Route params: { id } = variantId
 * @returns Updated cart
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withOptionalAuth(request, async (context) => {
    try {
      const body = await request.json();
      const parseResult = UpdateCartItemSchema.safeParse(body);
      if (!parseResult.success) {
        return apiErrorByCode("VALIDATION_INVALID_REQUEST", {
          issues: parseResult.error.issues,
        });
      }

      const { quantity, uomCode, customerGroup } = parseResult.data;
      const { id: idParam } = await params;
      const variantId = parseInt(idParam);

      if (!Number.isInteger(variantId) || variantId <= 0) {
        return apiErrorByCode("VALIDATION_INVALID_ITEM_ID");
      }

      const cartService = getServices().cart;

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const cart = await cartService.updateItemQuantity(cartId, variantId, quantity, {
        uomCode,
        customerGroup,
      });

      return apiResponse({
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          itemCount: cart.itemCount,
        },
      });
    } catch (error) {
      return apiErrorByCode("CART_UPDATE_ITEM_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}

/**
 * Remove item from cart
 *
 * @param request - Request object
 * @param params - Route params: { id } = variantId
 * @returns Updated cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withOptionalAuth(request, async (context) => {
    try {
      const { id: idParam } = await params;
      const variantId = parseInt(idParam);
      if (!Number.isInteger(variantId) || variantId <= 0) {
        return apiErrorByCode("VALIDATION_INVALID_ITEM_ID");
      }
      const cartService = getServices().cart;

      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const { searchParams } = new URL(request.url);
      const parsedSelectors = z
        .object({
          uomCode: UomCodeSchema.optional(),
          customerGroup: CustomerGroupSchema.optional(),
        })
        .safeParse({
          uomCode: searchParams.get("uomCode") || undefined,
          customerGroup: searchParams.get("customerGroup") || undefined,
        });

      if (!parsedSelectors.success) {
        return apiErrorByCode("VALIDATION_INVALID_QUERY_PARAMS", {
          issues: parsedSelectors.error.issues,
        });
      }

      const cart = await cartService.removeItem(cartId, variantId, parsedSelectors.data);

      return apiResponse({
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          itemCount: cart.itemCount,
        },
      });
    } catch (error) {
      return apiErrorByCode("CART_REMOVE_ITEM_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}
