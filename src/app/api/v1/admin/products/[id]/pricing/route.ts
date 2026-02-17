/**
 * Admin Product Variant Pricing Endpoint
 *
 * GET /api/v1/admin/products/[id]/pricing?variantKey=...&customerGroup=...
 * PUT /api/v1/admin/products/[id]/pricing
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse, apiErrorByCode } from "../../../../_lib/api-response";
import { withAdmin } from "../../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { CustomerGroupSchema, UomCodeSchema } from "@/features/core/domain/types/common";
import { API_SUCCESS_MESSAGES } from "@/features/core/domain/constants/messages";

const PricingQuerySchema = z.object({
  variantKey: z.string().min(1, "variantKey is required"),
  customerGroup: CustomerGroupSchema,
});

const UpsertVariantPricingBodySchema = z.object({
  variantKey: z.string().min(1, "variantKey is required"),
  prices: z
    .array(
      z.object({
        customerGroup: CustomerGroupSchema,
        uomCode: UomCodeSchema,
        unitPrice: z.number().nonnegative("unitPrice must be non-negative"),
        currency: z.string().min(3).max(3).optional(),
        isSellable: z.boolean().optional(),
      }),
    )
    .min(1, "At least one price row is required"),
});

/**
 * Gets variant pricing options for a product by customer group.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(request, async () => {
    try {
      const { id: productIdParam } = await params;
      const productId = Number(productIdParam);
      if (!Number.isInteger(productId) || productId <= 0) {
        return apiErrorByCode("CATALOG_INVALID_PRODUCT_ID");
      }

      const { searchParams } = new URL(request.url);
      const parseResult = PricingQuerySchema.safeParse({
        variantKey: searchParams.get("variantKey") || "",
        customerGroup: searchParams.get("customerGroup"),
      });
      if (!parseResult.success) {
        return apiErrorByCode("VALIDATION_INVALID_QUERY_PARAMS", {
          issues: parseResult.error.issues,
        });
      }

      const { variantKey, customerGroup } = parseResult.data;
      const { repositories } = getServices();
      const options = await repositories.products.getVariantSellOptions(
        productId,
        variantKey,
        customerGroup,
      );

      return apiResponse({ productId, variantKey, customerGroup, prices: options });
    } catch (error) {
      return apiErrorByCode("CATALOG_VARIANT_PRICING_FETCH_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}

/**
 * Upserts variant price lists for a product.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(request, async () => {
    try {
      const { id: productIdParam } = await params;
      const productId = Number(productIdParam);
      if (!Number.isInteger(productId) || productId <= 0) {
        return apiErrorByCode("CATALOG_INVALID_PRODUCT_ID");
      }

      const body = await request.json();
      const parseResult = UpsertVariantPricingBodySchema.safeParse(body);
      if (!parseResult.success) {
        return apiErrorByCode("VALIDATION_INVALID_REQUEST_BODY", {
          issues: parseResult.error.issues,
        });
      }

      const { variantKey, prices } = parseResult.data;
      const { repositories } = getServices();
      await repositories.products.upsertVariantPriceLists(productId, variantKey, prices);

      return apiResponse({
        message: API_SUCCESS_MESSAGES.VARIANT_PRICING_UPDATED,
        productId,
        variantKey,
      });
    } catch (error) {
      return apiErrorByCode("CATALOG_VARIANT_PRICING_UPDATE_FAILED", {
        reason: error instanceof Error ? error.message : undefined,
      });
    }
  });
}
