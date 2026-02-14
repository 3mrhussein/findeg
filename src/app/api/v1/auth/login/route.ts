/**
 * User Login Endpoint
 *
 * POST /api/v1/auth/login
 * Authenticates user with email/password and returns JWT token.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { getServices } from "@/server/getServices";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

/**
 * Login user
 *
 * @param request - Request with JSON body: { email, password }
 * @returns JWT token + user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return apiError("Email and password are required", 400);
    }

    const { authService } = getServices();
    const result = await authService.login(email, password);

    if (!result.success || !result.user) {
      return apiError(result.error || "Invalid email or password", 401);
    }

    const { user } = result;

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    return apiResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return apiError(error.message, 401);
    }
    return apiError("Login failed", 500);
  }
}
