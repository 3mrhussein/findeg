/**
 * User Registration Endpoint
 *
 * POST /api/v1/auth/register
 * Creates a new user account with email/password authentication.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiError } from "../../_lib/api-response";
import { getServices } from "@/server/getServices";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

/**
 * Register new user
 *
 * @param request - Request with JSON body: { email, password, firstName, lastName, phone }
 * @returns JWT token + user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    // Validation
    if (!email || !password) {
      return apiError("Email and password are required", 400);
    }

    if (password.length < 8) {
      return apiError("Password must be at least 8 characters", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Invalid email format", 400);
    }

    const { authService } = getServices();

    // Register user
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    if (!result.success || !result.user) {
      return apiError(result.error || "Registration failed", 400);
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

    return apiResponse(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        },
      },
      201,
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return apiError("Email already registered", 409);
      }
      return apiError(error.message, 400);
    }
    return apiError("Registration failed", 500);
  }
}
