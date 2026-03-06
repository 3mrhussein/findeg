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
      const cartService = getServices().cart;
      const productService = getServices().products;

      // Verify product exists
      const product = await productService.getById(productId);
      if (!product) {
        return apiErrorByCode("CATALOG_PRODUCT_NOT_FOUND");
      }

      // Determine cart identifier
      const cartId = context.user
        ? `user_${context.user.userId}`
        : request.headers.get("X-Guest-Id") || "guest_anonymous";

      // Resolve pricing from the first available variant's base price
      const firstVariant = product.variants?.[0];
      const unitPrice = firstVariant?.basePrice ?? 0;
      const resolvedSku = firstVariant?.sku ?? `PROD-${productId}`;
      const resolvedVariantId = firstVariant?.id ?? 0;
      const resolvedUomCode = uomCode ?? DOMAIN_DEFAULTS.UOM_CODE;
      const resolvedCurrency = firstVariant?.priceLists?.[0]?.currency ?? DOMAIN_DEFAULTS.CURRENCY;

      const cart = await cartService.addItem(cartId, {
        productId,
        variantId: resolvedVariantId,
        sku: resolvedSku,
        productName: product.name,
        variantLabel:
          (variant ? JSON.stringify(variant) : null) ?? variantKey ?? DOMAIN_DEFAULTS.VARIANT_KEY,
        imageUrl: firstVariant?.images?.[0]?.url,
        quantity,
        uomCode: resolvedUomCode,
        uomFactor: 1,
        unitPrice,
        currency: resolvedCurrency,
        customerGroup: customerGroup ?? DOMAIN_DEFAULTS.CUSTOMER_GROUP,
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
