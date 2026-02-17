/**
 * User Login Endpoint
 *
 * POST /api/v1/auth/login
 * Authenticates user with email/password and returns JWT token.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { getServices } from "@/server/getServices";
import { SignJWT } from "jose";
import { AuthCredentialsSchema } from "@/features/core/domain/auth";
import { AUTH_CONSTANTS } from "@/features/core/domain/constants/auth";
import { validateWithResult } from "@/features/core/domain/errors";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || AUTH_CONSTANTS.JWT_SECRET_FALLBACK,
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
    const parsed = validateWithResult(AuthCredentialsSchema, body);
    if (!parsed.ok) {
      return apiErrorByCode(parsed.error.code, parsed.error.details);
    }

    const { email, password } = parsed.value;
    const { authService } = getServices();
    const result = await authService.login(email, password);

    if (!result.success || !result.user) {
      return apiErrorByCode("AUTH_INVALID_CREDENTIALS");
    }

    const { user } = result;

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: AUTH_CONSTANTS.JWT_ALGORITHM })
      .setExpirationTime(AUTH_CONSTANTS.USER_TOKEN_EXPIRY)
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
    return apiErrorByCode("AUTH_LOGIN_FAILED", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
