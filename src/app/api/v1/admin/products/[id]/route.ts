/**
 * Admin Single Product Endpoint
 *
 * GET /api/v1/admin/products/[id] - Get product with all translations
 * PUT /api/v1/admin/products/[id] - Update product
 * DELETE /api/v1/admin/products/[id] - Delete product
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../../_lib/api-response";
import { withAdmin } from "../../../_lib/middleware";
import { getServices } from "@/server/getServices";
import { PERMISSION_CODES } from "@/features/core/domain/auth";

/**
 * Get single product (admin)
 *
 * @param request - Request object
 * @param params - Route params: { id }
 * @returns Product with all translations
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(
    request,
    async () => {
      try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const { adminProduct } = getServices();

        const product = await adminProduct.getByIdWithTranslations(id);

        if (!product) {
          return apiError("Product not found", 404);
        }

        return apiResponse(product);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to retrieve product", 500);
      }
    },
    PERMISSION_CODES.ADMIN_PRODUCTS_READ,
  );
}

/**
 * Update product (admin)
 *
 * @param request - Request with JSON body: ProductInput
 * @param params - Route params: { id }
 * @returns Updated product
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(
    request,
    async () => {
      try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();
        const { adminProduct } = getServices();
        const product = await adminProduct.update(id, body);
        return apiResponse(product);
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to update product", 500);
      }
    },
    PERMISSION_CODES.ADMIN_PRODUCTS_WRITE,
  );
}

/**
 * Delete product (admin)
 *
 * @param request - Request object
 * @param params - Route params: { id }
 * @returns Success response
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAdmin(
    request,
    async () => {
      try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const { adminProduct } = getServices();
        await adminProduct.delete(id);
        return apiResponse({ message: "Product deleted successfully" });
      } catch (error) {
        return apiError(error instanceof Error ? error.message : "Failed to delete product", 500);
      }
    },
    PERMISSION_CODES.ADMIN_PRODUCTS_WRITE,
  );
}
