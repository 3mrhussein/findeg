/**
 * Token Refresh Endpoint
 *
 * POST /api/v1/auth/refresh
 * Refreshes an expired or expiring JWT token.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { AUTH_CONSTANTS } from "@/features/core/domain/constants/auth";
import { validateWithResult } from "@/features/core/domain/errors";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || AUTH_CONSTANTS.JWT_SECRET_FALLBACK,
);

const RefreshTokenSchema = z.object({
  token: z.string().min(1),
});

/**
 * Refresh JWT token
 *
 * @param request - Request with JSON body: { token }
 * @returns New JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateWithResult(RefreshTokenSchema, body, "VALIDATION_INVALID_REQUEST_BODY");
    if (!parsed.ok) {
      return apiErrorByCode(parsed.error.code, parsed.error.details);
    }
    const { token } = parsed.value;

    // Verify existing token (even if expired, we can still read the payload)
    let payload;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload;
    } catch {
      return apiErrorByCode("AUTH_INVALID_TOKEN");
    }

    // Generate new token with same payload
    const newToken = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })
      .setProtectedHeader({ alg: AUTH_CONSTANTS.JWT_ALGORITHM })
      .setExpirationTime(AUTH_CONSTANTS.USER_TOKEN_EXPIRY)
      .sign(JWT_SECRET);

    return apiResponse({
      token: newToken,
    });
  } catch (error) {
    return apiErrorByCode("AUTH_REFRESH_FAILED", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
