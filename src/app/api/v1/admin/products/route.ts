/**
 * Admin Products Endpoint
 *
 * GET /api/v1/admin/products - List all products with filters
 * POST /api/v1/admin/products - Create new product
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError, apiPaginatedResponse } from "../../_lib/api-response";
import { withAdmin } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 * List all products (admin)
 *
 * @param request - Request with query params: page, limit, search, categoryId, brandId
 * @returns Paginated list of products
 */
export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const page = Number(searchParams.get("page")) || 1;
      const limit = Number(searchParams.get("limit")) || 20;
      const search = searchParams.get("search") || undefined;
      const categoryId = searchParams.get("categoryId")
        ? Number(searchParams.get("categoryId"))
        : undefined;
      const brandId = searchParams.get("brandId") ? Number(searchParams.get("brandId")) : undefined;

      const { adminProduct } = getServices();

      // Get all products (could be enhanced with filters)
      const products = await adminProduct.getAll();

      // Apply filters if needed
      let filtered = products;
      if (search) {
        filtered = filtered.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));
      }
      if (categoryId) {
        filtered = filtered.filter((p) => p.categoryId === categoryId);
      }
      if (brandId) {
        filtered = filtered.filter((p) => p.brandId === brandId);
      }

      // Pagination
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      return apiPaginatedResponse(paginated, filtered.length, page, limit);
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to retrieve products", 500);
    }
  });
}

/**
 * Create new product (admin)
 *
 * @param request - Request with JSON body: AdminProductInput
 * @returns Created product
 */
export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const body = await request.json();
      const { adminProduct } = getServices();

      const product = await adminProduct.create(body);

      return apiResponse(product, 201);
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to create product", 500);
    }
  });
}
