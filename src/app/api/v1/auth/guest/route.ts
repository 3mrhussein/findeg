/**
 * Guest Session Endpoint
 *
 * POST /api/v1/auth/guest
 * Creates an anonymous guest session for cart management.
 */

import { NextRequest } from "next/server";
import { apiResponse } from "../../_lib/api-response";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
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
    const guestId = `guest_${randomUUID()}`;

    // Generate JWT token for guest
    const token = await new SignJWT({
      guestId,
      role: "guest",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d") // Longer expiry for guest sessions
      .sign(JWT_SECRET);

    return apiResponse({
      token,
      guestId,
    });
  } catch (error) {
    return apiResponse(
      {
        error: "Failed to create guest session",
      },
      500,
    );
  }
}
