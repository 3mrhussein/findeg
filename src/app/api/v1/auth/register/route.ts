/**
 * User Registration Endpoint
 *
 * POST /api/v1/auth/register
 * Creates a new user account with email/password authentication.
 */

import { NextRequest } from "next/server";
import { apiResponse, apiErrorByCode } from "../../_lib/api-response";
import { getServices } from "@/server/getServices";
import { SignJWT } from "jose";
import { RegisterInputSchema, createUserVO } from "@/features/core/domain/auth";
import { AUTH_CONSTANTS } from "@/features/core/domain/constants/auth";
import { getErrorDefinition, validateWithResult } from "@/features/core/domain/errors";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || AUTH_CONSTANTS.JWT_SECRET_FALLBACK,
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
    const parsed = validateWithResult(RegisterInputSchema, body);
    if (!parsed.ok) {
      return apiErrorByCode(parsed.error.code, parsed.error.details);
    }

    const authService = getServices().auth;

    // Register user
    const result = await authService.register(parsed.value);

    if (!result.success || !result.user) {
      if (result.error === getErrorDefinition("AUTH_EMAIL_ALREADY_REGISTERED").message) {
        return apiErrorByCode("AUTH_EMAIL_ALREADY_REGISTERED");
      }
      return apiErrorByCode("AUTH_REGISTER_FAILED", {
        reason: result.error,
      });
    }

    const { user } = result;
    const userVO = createUserVO({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      portalRole: user.portalRole,
      user: userVO,
      subjectId: String(user.id),
      actorType: "user",
    })
      .setProtectedHeader({ alg: AUTH_CONSTANTS.JWT_ALGORITHM })
      .setExpirationTime(AUTH_CONSTANTS.USER_TOKEN_EXPIRY)
      .sign(JWT_SECRET);

    return apiResponse(
      {
        token,
        user: {
          id: user.id,
          ...userVO,
          phone: user.phone,
          portalRole: user.portalRole,
        },
      },
      201,
    );
  } catch (error) {
    return apiErrorByCode("AUTH_REGISTER_FAILED", {
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}
