/**
 * User Logout Endpoint
 *
 * POST /api/v1/auth/logout
 * Invalidates the current session (client-side token removal).
 */

import { NextRequest } from "next/server";
import { apiResponse } from "../../_lib/api-response";
import { AUTH_SUCCESS_MESSAGES } from "@/features/core/domain/constants/auth";

/**
 * Logout user
 *
 * Note: Since we're using stateless JWT, logout is primarily client-side.
 * The client should discard the token. In the future, we could implement
 * a token blacklist for immediate invalidation.
 *
 * @param request - Request object
 * @returns Success response
 */
export async function POST(request: NextRequest) {
  // In a stateless JWT system, logout is handled client-side
  // Future enhancement: Add token to blacklist/revocation list

  return apiResponse({
    message: AUTH_SUCCESS_MESSAGES.LOGOUT_SUCCESS,
  });
}
