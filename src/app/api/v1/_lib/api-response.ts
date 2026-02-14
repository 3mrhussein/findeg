/**
 * API Response Utilities
 *
 * Standardized response helpers for REST API endpoints.
 * Ensures consistent JSON structure and HTTP status codes across all endpoints.
 */

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
