/**
 * Cart Item Management Endpoint
 *
 * POST /api/v1/cart/items
 * Adds an item to the cart.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { withOptionalAuth } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { AddCartItemSchema } from "@/features/cart/domain/schemas";
import { DOMAIN_DEFAULTS } from "@/features/core/domain/constants/messages";
import { validateWithResult } from "@/features/core/domain/errors";

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
      const parsed = validateWithResult(AddCartItemSchema, body);
      if (!parsed.ok) {
        return apiErrorByCode(parsed.error.code, parsed.error.details);
      }

      const { productId, quantity, variant, variantKey, uomCode, customerGroup } = parsed.value;
      const { cartService, productService } = getServices();

      // Verify product exists and has stock
      const product = await productService.getById(productId);
      if (!product) {
        return apiErrorByCode("CATALOG_PRODUCT_NOT_FOUND");
      }

      if (product.stockQuantity !== undefined && product.stockQuantity < quantity) {
        return apiErrorByCode("CART_INSUFFICIENT_STOCK", {
          availableQuantity: product.stockQuantity,
          requestedQuantity: quantity,
          productId,
        });
      }

      // Determine cart identifier
      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      const resolvedVariantKey = variantKey || DOMAIN_DEFAULTS.VARIANT_KEY;
      const quote =
        resolvedVariantKey && uomCode && customerGroup
          ? await productService.quoteVariantUnitPrice(
              productId,
              resolvedVariantKey,
              uomCode,
              customerGroup,
            )
          : null;

      const fallbackUnitPrice = product.price;
      const cart = await cartService.addItem(cartId, {
        productId,
        quantity,
        name: product.name,
        price: product.price,
        images: product.images || [],
        categoryName: product.categoryName,
        variant,
        variantKey: resolvedVariantKey,
        uomCode,
        customerGroup,
        unitPriceSnapshot: quote?.unitPrice ?? fallbackUnitPrice,
        currency: quote?.currency ?? DOMAIN_DEFAULTS.CURRENCY,
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
      return apiErrorByCode("CART_ADD_ITEM_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}
