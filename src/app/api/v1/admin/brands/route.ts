/**
 * Admin Brands Endpoint
 *
 * GET /api/v1/admin/brands - List all brands
 * POST /api/v1/admin/brands - Create new brand
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { withAdmin } from "../../_lib/middleware";
import { getServices } from "@/server/getServices";

/**
 *
 */
export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const { adminBrand } = getServices();
      const brands = await adminBrand.getAll();
      return apiResponse({ brands });
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to retrieve brands", 500);
    }
  });
}

/**
 *
 */
export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    try {
      const body = await request.json();
      const { adminBrand } = getServices();
      const brand = await adminBrand.create(body);
      return apiResponse(brand, 201);
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Failed to create brand", 500);
    }
  });
}
