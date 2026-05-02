import { redirect } from "@i18n/navigation";
import type { DomainError } from "@findeg/backend/features/core";

/**
 * Dashboard Error Handler Utilities
 *
 * Translates domain errors thrown by backend services to appropriate HTTP responses
 * or Next.js navigation calls (redirect, notFound).
 *
 * Backend services throw domain errors with semantic meaning.
 * App-layer catches them and converts to framework-specific responses.
 *
 * @example
 * try {
 *   const result = await backend.getDashboardData(userId);
 * } catch (error) {
 *   handleDomainError(error, "dashboard");
 * }
 */

/**
 * Main error handler that routes domain errors to appropriate handlers.
 *
 * @param error - Error thrown by backend service  (DomainError subclass)
 * @param context - Where the error occurred for logging (e.g., "auth", "products")
 * @throws Redirects user to login/403 as needed or returns JSON error
 */
export function handleDomainError(error: unknown, context?: string): Response | never {
  if (!(error instanceof Error)) {
    console.error("Unknown error in dashboard:", context, error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const domainError = error as DomainError & {
    code?: string;
    getStatusCode?: () => number;
    getClientMessage?: () => string;
  };

  // Log error for debugging
  console.error(`[${context}] ${domainError.name || "Error"}:`, {
    code: domainError.code,
    message: domainError.message,
  });

  // Route by error type
  switch (domainError.code) {
    case "NOT_AUTHENTICATED":
      redirect({ href: "/login", locale: "en" });

    case "NOT_AUTHORIZED":
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

    case "RESOURCE_NOT_FOUND":
      return new Response(JSON.stringify({ error: "Resource not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });

    case "VALIDATION_ERROR":
    case "VALIDATION_ERRORS":
      return new Response(
        JSON.stringify({
          error: domainError.getClientMessage?.() || "Validation failed",
          details: domainError.metadata,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );

    case "CONFLICT_ERROR":
      return new Response(
        JSON.stringify({ error: domainError.getClientMessage?.() || "Resource already exists" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );

    case "BUSINESS_RULE_VIOLATION":
      return new Response(JSON.stringify({ error: domainError.message }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });

    default:
      console.error("[dashboard] Unhandled domain error code:", domainError.code, domainError);
      return new Response(
        JSON.stringify({ error: domainError.getClientMessage?.() || "An error occurred" }),
        {
          status: domainError.getStatusCode?.() || 500,
          headers: { "Content-Type": "application/json" },
        },
      );
  }
}

/**
 * Type guard to check if error is a domain error.
 *
 * @param error - Error to check
 * @returns true if error is a DomainError subclass
 */
export function domainError(error: unknown): error is DomainError {
  return error instanceof Error && "code" in error && "metadata" in error;
}

/**
 * Get client-safe error message from domain error.
 *
 * @param error - Domain error
 * @returns Safe message for client
 */
export function getErrorMessage(error: DomainError): string {
  if (typeof (error as any).getClientMessage === "function") {
    return (error as any).getClientMessage();
  }
  return error.message;
}
