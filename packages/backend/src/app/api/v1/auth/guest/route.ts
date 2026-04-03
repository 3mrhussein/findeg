/**
 * Guest Session Endpoint
 *
 * POST /api/v1/auth/guest
 * Creates an anonymous guest session for cart management.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";
import { AUTH_CONSTANTS } from "@/features/core/domain/constants/auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || AUTH_CONSTANTS.JWT_SECRET_FALLBACK,
);

/**
 * Create guest session
 *
 * @param request - Request object
 * @returns Guest session token
 */
export async function POST(request: NextRequest) {
  try {
    // Generate unique guest ID
    const guestId = `${AUTH_CONSTANTS.GUEST_ID_PREFIX}${randomUUID()}`;

    // Generate JWT token for guest
    const token = await new SignJWT({
      guestId,
      role: AUTH_CONSTANTS.GUEST_ROLE,
    })
      .setProtectedHeader({ alg: AUTH_CONSTANTS.JWT_ALGORITHM })
      .setExpirationTime(AUTH_CONSTANTS.GUEST_TOKEN_EXPIRY)
      .sign(JWT_SECRET);

    return apiResponse({
      token,
      guestId,
    });
  } catch (error) {
    return apiErrorByCode("AUTH_GUEST_SESSION_FAILED", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
