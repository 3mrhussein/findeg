/**
 * Admin Product Variant Pricing Endpoint
 *
 * GET /api/v1/admin/products/[id]/pricing?variantKey=...&customerGroup=...
 *   → Returns the price-list rows for the given variant+customer-group.
 *
 * PUT /api/v1/admin/products/[id]/pricing
 *   → Upserts price-list rows for the given variant+customer-group.
 *
 * The route resolves the variantId by looking up the variant with the given
 * variantKey that belongs to the given product (productId).
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse, apiErrorByCode } from "../../../../_lib/api-response";
import { withAdmin } from "../../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { CustomerGroupSchema, UomCodeSchema } from "@/features/core/domain/types/common";
import { API_SUCCESS_MESSAGES } from "@/features/core/domain/constants/messages";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

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
 * Resolves a variantId from productId + variantKey.
 * Returns null if the variant does not exist or does not belong to this product.
 */
async function resolveVariantId(productId: number, variantKey: string): Promise<number | null> {
  const { repositories } = getServices();
  const variants = await repositories.variants.getByProductId(productId);
  const match = variants.find((v) => v.variantKey === variantKey);
  return match?.id ?? null;
}

/**
 * Gets variant price-list rows for a given product/variantKey/customerGroup.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(
    request,
    async () => {
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

        const variantId = await resolveVariantId(productId, variantKey);
        if (variantId === null) {
          return apiErrorByCode("CATALOG_VARIANT_NOT_FOUND");
        }

        const { repositories } = getServices();
        const sellOptions = await repositories.variants.getSellOptions(variantId, customerGroup);

        // Map sell options to price rows (include only options that have a price)
        const prices = sellOptions
          .filter((opt) => opt.unitPrice !== undefined)
          .map((opt) => ({
            customerGroup,
            uomCode: opt.uomCode,
            unitPrice: opt.unitPrice,
            currency: opt.currency,
            isSellable: opt.isSellable,
          }));

        return apiResponse({ productId, variantKey, customerGroup, prices });
      } catch (error) {
        return apiErrorByCode("CATALOG_VARIANT_PRICING_FETCH_FAILED", {
          reason: error instanceof Error ? error.message : undefined,
        });
      }
    },
    PERMISSION_CODES.ADMIN_PRODUCTS_READ,
  );
}

/**
 * Upserts variant price lists for a given product/variantKey.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(
    request,
    async () => {
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

        const variantId = await resolveVariantId(productId, variantKey);
        if (variantId === null) {
          return apiErrorByCode("CATALOG_VARIANT_NOT_FOUND");
        }

        const { repositories } = getServices();
        await repositories.variants.upsertPriceLists(
          variantId,
          prices.map((p) => ({
            customerGroup: p.customerGroup,
            uomCode: p.uomCode,
            unitPrice: p.unitPrice as any,
            currency: p.currency as any,
            isSellable: p.isSellable,
          })),
        );

        return apiResponse({
          message: API_SUCCESS_MESSAGES.VARIANT_PRICING_UPDATED,
          productId,
          variantKey,
          variantId,
        });
      } catch (error) {
        return apiErrorByCode("CATALOG_VARIANT_PRICING_UPDATE_FAILED", {
          reason: error instanceof Error ? error.message : undefined,
        });
      }
    },
    PERMISSION_CODES.ADMIN_PRODUCTS_WRITE,
  );
}
