/**
 * Current User Endpoint
 *
 * GET /api/v1/auth/me
 * Retrieves the currently authenticated user's session information.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { getServices } from "@/server/getServices";

/**
 * Get current user session
 *
 * @param request - Request object
 * @returns User session details
 */
export async function GET(request: NextRequest) {
  try {
    const { auth } = getServices();
    const session = await auth.getSession();

    if (!session) {
      return apiError("Unauthorized", 401);
    }

    return apiResponse({
      user: session,
    });
  } catch (error) {
    return apiError("Failed to fetch user session", 500);
  }
}
