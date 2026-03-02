/**
 * Admin Product Variant UoMs Endpoint
 *
 * GET /api/v1/admin/products/[id]/uoms?variantKey=...
 *   → Returns the sellable UoMs for the given variant.
 *
 * PUT /api/v1/admin/products/[id]/uoms
 *   → Upserts sellable UoM definitions for the given variant.
 *
 * The route resolves the variantId by looking up the variant with the given
 * variantKey that belongs to the given product (productId).
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse, apiErrorByCode } from "../../../../_lib/api-response";
import { withAdmin } from "../../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { UomCodeSchema } from "@/features/core/domain/types/common";
import { API_SUCCESS_MESSAGES } from "@/features/core/domain/constants/messages";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

const VariantKeyQuerySchema = z.object({
  variantKey: z.string().min(1, "variantKey is required"),
});

const UpsertVariantUomsBodySchema = z.object({
  variantKey: z.string().min(1, "variantKey is required"),
  uoms: z
    .array(
      z.object({
        uomCode: UomCodeSchema,
        factorToBase: z.number().positive("factorToBase must be greater than 0"),
        isEnabled: z.boolean().optional(),
      }),
    )
    .min(1, "At least one UoM is required"),
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
 * Gets sellable UoMs for a product variant.
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
        const parseResult = VariantKeyQuerySchema.safeParse({
          variantKey: searchParams.get("variantKey") || "",
        });
        if (!parseResult.success) {
          return apiErrorByCode("VALIDATION_INVALID_QUERY_PARAMS", {
            issues: parseResult.error.issues,
          });
        }

        const { variantKey } = parseResult.data;

        const variantId = await resolveVariantId(productId, variantKey);
        if (variantId === null) {
          return apiErrorByCode("CATALOG_VARIANT_NOT_FOUND");
        }

        const { repositories } = getServices();
        // getSellOptions returns UoM + optional price info; extract UoM fields only
        const sellOptions = await repositories.variants.getSellOptions(variantId);
        const uoms = sellOptions.map((opt) => ({
          uomCode: opt.uomCode,
          factorToBase: opt.factorToBase,
          isEnabled: opt.isEnabled,
        }));

        return apiResponse({ productId, variantKey, variantId, uoms });
      } catch (error) {
        return apiErrorByCode("CATALOG_VARIANT_UOMS_FETCH_FAILED", {
          reason: error instanceof Error ? error.message : undefined,
        });
      }
    },
    PERMISSION_CODES.ADMIN_PRODUCTS_READ,
  );
}

/**
 * Upserts sellable UoMs for a product variant.
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
        const parseResult = UpsertVariantUomsBodySchema.safeParse(body);
        if (!parseResult.success) {
          return apiErrorByCode("VALIDATION_INVALID_REQUEST_BODY", {
            issues: parseResult.error.issues,
          });
        }

        const { variantKey, uoms } = parseResult.data;

        const variantId = await resolveVariantId(productId, variantKey);
        if (variantId === null) {
          return apiErrorByCode("CATALOG_VARIANT_NOT_FOUND");
        }

        const { repositories } = getServices();
        await repositories.variants.upsertSellableUoms(
          variantId,
          uoms.map((u) => ({
            uomCode: u.uomCode,
            factorToBase: u.factorToBase,
            isEnabled: u.isEnabled,
          })),
        );

        return apiResponse({
          message: API_SUCCESS_MESSAGES.VARIANT_UOMS_UPDATED,
          productId,
          variantKey,
          variantId,
        });
      } catch (error) {
        return apiErrorByCode("CATALOG_VARIANT_UOMS_UPDATE_FAILED", {
          reason: error instanceof Error ? error.message : undefined,
        });
      }
    },
    PERMISSION_CODES.ADMIN_PRODUCTS_WRITE,
  );
}
