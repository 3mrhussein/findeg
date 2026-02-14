/**
 * Token Refresh Endpoint
 *
 * POST /api/v1/auth/refresh
 * Refreshes an expired or expiring JWT token.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

/**
 * Refresh JWT token
 *
 * @param request - Request with JSON body: { token }
 * @returns New JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return apiError("Token is required", 400);
    }

    // Verify existing token (even if expired, we can still read the payload)
    let payload;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload;
    } catch (error) {
      return apiError("Invalid token", 401);
    }

    // Generate new token with same payload
    const newToken = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    return apiResponse({
      token: newToken,
    });
  } catch (error) {
    return apiError("Token refresh failed", 500);
  }
}
