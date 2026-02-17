/**
 * Current User Endpoint
 *
 * GET /api/v1/auth/me
 * Retrieves the currently authenticated user's session information.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
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
      return apiErrorByCode("AUTH_UNAUTHORIZED");
    }

    return apiResponse({
      user: session,
    });
  } catch (error) {
    return apiErrorByCode("AUTH_ME_FETCH_FAILED", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
