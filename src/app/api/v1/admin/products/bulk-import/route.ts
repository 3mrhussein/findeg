/**
 * Admin Bulk Product Import Endpoint
 *
 * POST /api/v1/admin/products/bulk-import
 * Imports multiple products from CSV or JSON array.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 * Bulk import products (admin)
 *
 * @param request - Request with JSON body: { products: AdminProductInput[] }
 * @returns Import summary with success/error counts
 */
export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const body = await request.json();
      const { products } = body;

      if (!Array.isArray(products)) {
        return apiError("Products must be an array", 400);
      }

      const { adminProduct } = getServices();

      const results = {
        total: products.length,
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const productData of products) {
        try {
          await adminProduct.create(productData);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(
            `Product ${productData.sku || "unknown"}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          );
        }
      }

      return apiResponse({
        message: "Bulk import completed",
        results,
      });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Bulk import failed", 500);
    }
  });
}
