/**
 * Product Variant Pricing Quote Endpoint
 *
 * GET /api/v1/products/[id]/pricing/quote?variantId=...&uomCode=...&customerGroup=...
 *
 * Resolves effective unit price for a concrete variant/UoM/customer-group tuple.
 * Reads directly from the variant's price list in the product entity.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse, apiErrorByCode } from "../../../../_lib/api-response";
import { getServices } from "@/server/getServices";
import { CustomerGroupSchema, UomCodeSchema } from "@/features/core/domain/types/common";

const QuoteQuerySchema = z.object({
  variantId: z.string().regex(/^\d+$/, "variantId must be a positive integer").transform(Number),
  uomCode: UomCodeSchema,
  customerGroup: CustomerGroupSchema.default("public_b2c"),
});

/**
 * Resolves a price quote for a variant/UoM.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productIdParam } = await params;
    const productId = Number(productIdParam);
    if (!Number.isInteger(productId) || productId <= 0) {
      return apiErrorByCode("CATALOG_INVALID_PRODUCT_ID");
    }

    const { searchParams } = new URL(request.url);
    const parseResult = QuoteQuerySchema.safeParse({
      variantId: searchParams.get("variantId") || "",
      uomCode: searchParams.get("uomCode"),
      customerGroup: searchParams.get("customerGroup") || "public_b2c",
    });

    if (!parseResult.success) {
      return apiErrorByCode("VALIDATION_INVALID_QUERY_PARAMS", {
        issues: parseResult.error.issues,
      });
    }

    const { variantId, uomCode, customerGroup } = parseResult.data;
    const productService = getServices().products;

    // Fetch the product and resolve pricing from its variant's price lists
    const product = await productService.getById(productId);
    if (!product) {
      return apiErrorByCode("CATALOG_PRODUCT_NOT_FOUND");
    }

    const variant = product.variants?.find((v) => v.id === variantId);
    if (!variant) {
      return apiErrorByCode("CATALOG_VARIANT_PRICE_NOT_FOUND");
    }

    // Look for a matching price list entry
    const priceEntry = variant.priceLists?.find(
      (p) =>
        p.uomCode === uomCode &&
        (p.customerGroup === customerGroup || p.customerGroup === "public_b2c"),
    );

    const unitPrice = priceEntry?.unitPrice ?? variant.basePrice;
    const currency = priceEntry?.currency ?? "EGP";

    if (!unitPrice) {
      return apiErrorByCode("CATALOG_VARIANT_PRICE_NOT_FOUND");
    }

    return apiResponse({
      productId,
      variantId,
      uomCode,
      customerGroup,
      unitPrice,
      currency,
      isSellable: true,
    });
  } catch (error) {
    return apiErrorByCode("SYSTEM_UNEXPECTED_ERROR", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
