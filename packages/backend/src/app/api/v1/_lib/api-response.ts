/**
 * API Response Utilities
 *
 * Standardized response helpers for REST API endpoints.
 * Ensures consistent JSON structure and HTTP status codes across all endpoints.
 */

import { AppErrorCode, getErrorDefinition } from "@/features/core/domain/errors/error-catalog";

/**
 * Standard API success response
 *
 * @param data - Response payload
 * @param status - HTTP status code (default: 200)
 * @returns Next.js Response object with JSON body
 */
export function apiResponse<T>(data: T, status: number = 200): Response {
  return Response.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

/**
 * Standard API error response
 *
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param errors - Optional validation errors or additional details
 * @returns Next.js Response object with error JSON body
 */
export function apiError(
  message: string,
  status: number = 400,
  errors?: Record<string, unknown>,
): Response {
  return Response.json(
    {
      success: false,
      error: {
        message,
        ...(errors && { details: errors }),
      },
    },
    { status },
  );
}

/**
 * Standard API error response using centralized error code catalog.
 *
 * @param errorCode - Stable machine-readable error code.
 * @param details - Optional validation errors or additional details.
 * @param statusOverride - Optional explicit HTTP status override.
 * @returns Next.js Response object with standardized error payload.
 */
export function apiErrorByCode(
  errorCode: AppErrorCode,
  details?: Record<string, unknown>,
  statusOverride?: number,
): Response {
  const definition = getErrorDefinition(errorCode);
  return Response.json(
    {
      success: false,
      error: {
        errorCode,
        message: definition.message,
        ...(details && { details }),
      },
    },
    { status: statusOverride ?? definition.httpStatus },
  );
}

/**
 * Paginated API response
 *
 * @param data - Array of items
 * @param total - Total count of items (before pagination)
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Next.js Response object with paginated JSON body
 */
export function apiPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): Response {
  return Response.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status: 200 },
  );
}
