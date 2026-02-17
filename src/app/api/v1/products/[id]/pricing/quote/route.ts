/**
 * Product Variant Pricing Quote Endpoint
 *
 * GET /api/v1/products/[id]/pricing/quote?variantKey=...&uomCode=...&customerGroup=...
 *
 * Resolves effective unit price for a concrete variant/UoM/customer-group tuple.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse, apiErrorByCode } from "../../../../_lib/api-response";
import { getServices } from "@/server/getServices";
import { CustomerGroupSchema, UomCodeSchema } from "@/features/core/domain/types/common";

const QuoteQuerySchema = z.object({
  variantKey: z.string().min(1, "variantKey is required"),
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
      variantKey: searchParams.get("variantKey") || "",
      uomCode: searchParams.get("uomCode"),
      customerGroup: searchParams.get("customerGroup") || "public_b2c",
    });

    if (!parseResult.success) {
      return apiErrorByCode("VALIDATION_INVALID_QUERY_PARAMS", {
        issues: parseResult.error.issues,
      });
    }

    const { variantKey, uomCode, customerGroup } = parseResult.data;
    const { productService } = getServices();

    const quote = await productService.quoteVariantUnitPrice(
      productId,
      variantKey,
      uomCode,
      customerGroup,
    );

    if (!quote) {
      return apiErrorByCode("CATALOG_VARIANT_PRICE_NOT_FOUND");
    }

    return apiResponse({
      productId,
      variantKey,
      uomCode,
      customerGroup,
      unitPrice: quote.unitPrice,
      currency: quote.currency,
      isSellable: quote.isSellable,
    });
  } catch (error) {
    return apiErrorByCode("SYSTEM_UNEXPECTED_ERROR", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
